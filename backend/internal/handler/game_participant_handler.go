package handler

import (
	"net/http"
	"strconv"

	"gotlucky/internal/dto"
	"gotlucky/internal/model"
	"gotlucky/internal/service"

	"github.com/gin-gonic/gin"
)

type GameParticipantHandler struct {
	Service *service.GameParticipantService
}

func NewGameParticipantHandler(s *service.GameParticipantService) *GameParticipantHandler {
	return &GameParticipantHandler{Service: s}
}

func (h *GameParticipantHandler) AddParticipant(c *gin.Context) {
	sessionID, _ := strconv.Atoi(c.Param("id"))

	var p model.GameParticipant
	if err := c.ShouldBindJSON(&p); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	p.GameSessionID = uint(sessionID)

	if err := h.Service.AddParticipant(&p); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, p)
}

func (h *GameParticipantHandler) GetParticipants(c *gin.Context) {
	sessionID, _ := strconv.Atoi(c.Param("id"))
	participants, err := h.Service.GetParticipantsBySession(uint(sessionID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, participants)
}

func (h *GameParticipantHandler) GetParticipant(c *gin.Context) {
	sessionID, _ := strconv.Atoi(c.Param("id"))
	participantID, _ := strconv.Atoi(c.Param("p_id"))

	p, err := h.Service.GetParticipant(uint(sessionID), uint(participantID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, p)
}

func (h *GameParticipantHandler) SetResult(c *gin.Context) {
	sessionID, _ := strconv.Atoi(c.Param("id"))

	var inputs []dto.GameResultInput
	if err := c.ShouldBindJSON(&inputs); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.Service.SetRanks(uint(sessionID), inputs); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ranking updated"})
}

func (h *GameParticipantHandler) GetResult(c *gin.Context) {
	sessionID, _ := strconv.Atoi(c.Param("id"))

	session, err := h.Service.GetSessionWithResult(uint(sessionID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	participants, err := h.Service.GetParticipants(uint(sessionID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"game":         session,
		"participants": participants,
	})
}
