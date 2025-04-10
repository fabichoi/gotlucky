package handler

import (
	"net/http"
	"strconv"

	"gotlucky/internal/dto"
	"gotlucky/internal/model"
	"gotlucky/internal/service"

	"github.com/gin-gonic/gin"
)

type GameResultHandler struct {
	Service *service.GameResultService
}

func NewGameResultHandler(s *service.GameResultService) *GameResultHandler {
	return &GameResultHandler{Service: s}
}

func (h *GameResultHandler) AddGameResult(c *gin.Context) {
	sessionID, _ := strconv.Atoi(c.Param("id"))

	var inputs []dto.GameResultInput
	if err := c.ShouldBindJSON(&inputs); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var results []*model.GameResult
	for _, input := range inputs {
		p := &model.GameResult{
			GameSessionID: uint(sessionID),
			UserID:        input.UserID,
			PointsEarned:  input.PointsEarned,
			Rank:          input.Rank,
		}
		results = append(results, p)
	}

	if err := h.Service.AddGameResult(results); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, results)
}

func (h *GameResultHandler) GetGameResults(c *gin.Context) {
	sessionID, _ := strconv.Atoi(c.Param("id"))
	gameResults, err := h.Service.GetGameResultsBySession(uint(sessionID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gameResults)
}

func (h *GameResultHandler) GetGameResult(c *gin.Context) {
	sessionID, _ := strconv.Atoi(c.Param("id"))
	gameResultID, _ := strconv.Atoi(c.Param("p_id"))

	p, err := h.Service.GetGameResult(uint(sessionID), uint(gameResultID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, p)
}
