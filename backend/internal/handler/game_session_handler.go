package handler

import (
	"net/http"
	"strconv"
	"time"

	"gotlucky/internal/model"
	"gotlucky/internal/service"

	"github.com/gin-gonic/gin"
)

type GameSessionHandler struct {
	Service *service.GameSessionService
}

func NewGameSessionHandler(s *service.GameSessionService) *GameSessionHandler {
	return &GameSessionHandler{Service: s}
}

func (h *GameSessionHandler) CreateGameSession(c *gin.Context) {
	var input struct {
		Date       string `json:"date"`
		GameTypeID uint   `json:"game_type_id"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	parseDate, err := time.Parse("2006-01-02", input.Date)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid date format"})
		return
	}

	session := &model.GameSession{
		Date:       parseDate,
		GameTypeID: input.GameTypeID,
	}

	if err := h.Service.CreateGameSession(session); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, session)
}

func (h *GameSessionHandler) ListGameSessions(c *gin.Context) {
	sessions, err := h.Service.GetAllGameSessions()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, sessions)
}

func (h *GameSessionHandler) GetGameSession(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	session, err := h.Service.GetGameSessionByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, session)
}
