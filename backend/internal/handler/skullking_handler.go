package handler

import (
	"errors"
	"net/http"
	"strconv"

	"gotlucky/internal/model"
	"gotlucky/internal/service"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type SkullKingHandler struct {
	Service *service.SkullKingService
}

func NewSkullKingHandler(s *service.SkullKingService) *SkullKingHandler {
	return &SkullKingHandler{Service: s}
}

func (h *SkullKingHandler) CreateGame(c *gin.Context) {
	var input struct {
		PlayerIDs []uint `json:"player_ids"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	game, err := h.Service.CreateGame(input.PlayerIDs)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, game)
}

func (h *SkullKingHandler) GetActiveGame(c *gin.Context) {
	userID, _ := c.Get("userID")
	
	// Fetch user to check role
	var user model.User
	if err := h.Service.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not found"})
		return
	}

	game, err := h.Service.GetActiveGame(user.ID, user.Role == "admin")
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "no active game"})
			return
		}
		if err.Error() == "not a participant of the active game" {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, game)
}

func (h *SkullKingHandler) UpdateScore(c *gin.Context) {
	var input struct {
		GameID uint `json:"game_id"`
		UserID uint `json:"user_id"`
		Round  int  `json:"round"`
		Bid    int  `json:"bid"`
		Actual int  `json:"actual"`
		Bonus  int  `json:"bonus"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.Service.UpdateScore(input.GameID, input.UserID, input.Round, input.Bid, input.Actual, input.Bonus)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "score updated"})
}

func (h *SkullKingHandler) GetHistory(c *gin.Context) {
	games, err := h.Service.GetHistory()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, games)
}

func (h *SkullKingHandler) AddPlayer(c *gin.Context) {
	var input struct {
		GameID uint `json:"game_id"`
		UserID uint `json:"user_id"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.Service.AddPlayer(input.GameID, input.UserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "player added"})
}

func (h *SkullKingHandler) DeleteGame(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := h.Service.DeleteGame(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "game deleted"})
}

func (h *SkullKingHandler) EndGame(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := h.Service.EndGame(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "game ended"})
}
