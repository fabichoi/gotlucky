package handler

import (
	"errors"
	"net/http"
	"strconv"
	"strings"

	"gotlucky/internal/model"
	"gotlucky/internal/service"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type WizardHandler struct {
	Service *service.WizardService
}

func NewWizardHandler(s *service.WizardService) *WizardHandler {
	return &WizardHandler{Service: s}
}

func (h *WizardHandler) CreateGame(c *gin.Context) {
	userID, _ := c.Get("userID")

	game, err := h.Service.CreateGame(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, game)
}

func (h *WizardHandler) JoinRoom(c *gin.Context) {
	userID, _ := c.Get("userID")
	var input struct {
		RoomCode string `json:"room_code"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.Service.JoinRoom(userID.(uint), input.RoomCode); err != nil {
		if strings.HasPrefix(err.Error(), "request_sent") {
			c.JSON(http.StatusAccepted, gin.H{"message": err.Error()})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "joined successfully"})
}

func (h *WizardHandler) ApproveJoinRequest(c *gin.Context) {
	requesterID, _ := c.Get("userID")
	var input struct {
		GameID uint `json:"game_id"`
		UserID uint `json:"user_id"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.Service.ApproveJoinRequest(input.GameID, requesterID.(uint), input.UserID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "approved"})
}

func (h *WizardHandler) RejectJoinRequest(c *gin.Context) {
	requesterID, _ := c.Get("userID")
	var input struct {
		GameID uint `json:"game_id"`
		UserID uint `json:"user_id"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.Service.RejectJoinRequest(input.GameID, requesterID.(uint), input.UserID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "rejected"})
}

func (h *WizardHandler) StartGame(c *gin.Context) {
	requesterID, _ := c.Get("userID")
	id, _ := strconv.Atoi(c.Param("id"))

	if err := h.Service.StartGame(uint(id), requesterID.(uint)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "game started"})
}

func (h *WizardHandler) GetActiveGame(c *gin.Context) {
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

func (h *WizardHandler) UpdateScore(c *gin.Context) {
	requesterID, _ := c.Get("userID")
	var input struct {
		GameID uint `json:"game_id"`
		UserID uint `json:"user_id"`
		Round  int  `json:"round"`
		Bid    int  `json:"bid"`
		Actual int  `json:"actual"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.Service.UpdateScore(input.GameID, input.UserID, requesterID.(uint), input.Round, input.Bid, input.Actual)
	if err != nil {
		if err.Error() == "only room manager can update scores" {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "score updated"})
}

func (h *WizardHandler) GetHistory(c *gin.Context) {
	games, err := h.Service.GetHistory()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, games)
}

func (h *WizardHandler) DeleteGame(c *gin.Context) {
	requesterID, _ := c.Get("userID")
	id, _ := strconv.Atoi(c.Param("id"))
	if err := h.Service.DeleteGame(uint(id), requesterID.(uint)); err != nil {
		if err.Error() == "only host can delete the game" {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "game deleted"})
}

func (h *WizardHandler) EndGame(c *gin.Context) {
	requesterID, _ := c.Get("userID")
	id, _ := strconv.Atoi(c.Param("id"))
	if err := h.Service.EndGame(uint(id), requesterID.(uint)); err != nil {
		if err.Error() == "only room manager can end the game" {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "game ended"})
}

func (h *WizardHandler) ListWaitingRooms(c *gin.Context) {
	games, err := h.Service.ListWaitingRooms()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, games)
}
