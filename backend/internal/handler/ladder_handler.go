package handler

import (
	"errors"
	"net/http"
	"strconv"

	"gotlucky/internal/service"
	"gotlucky/internal/util"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type LadderHandler struct {
	Service *service.LadderService
}

func NewLadderHandler(s *service.LadderService) *LadderHandler {
	return &LadderHandler{Service: s}
}

func (h *LadderHandler) CreateGame(c *gin.Context) {
	userID, ok := util.GetUserIDFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "인증이 필요합니다"})
		return
	}

	var input struct {
		Results []string `json:"results"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	game, err := h.Service.CreateGame(userID, input.Results)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, game)
}

func (h *LadderHandler) ListRooms(c *gin.Context) {
	rooms, err := h.Service.ListRooms()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, rooms)
}

func (h *LadderHandler) JoinRoom(c *gin.Context) {
	userID, ok := util.GetUserIDFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "인증이 필요합니다"})
		return
	}

	var input struct {
		RoomCode string `json:"room_code"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.Service.JoinRoom(userID, input.RoomCode); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "참여 완료"})
}

func (h *LadderHandler) StartGame(c *gin.Context) {
	userID, ok := util.GetUserIDFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "인증이 필요합니다"})
		return
	}

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "잘못된 게임 ID 입니다"})
		return
	}

	game, err := h.Service.StartGame(uint(id), userID)
	if err != nil {
		if err.Error() == "방장만 게임을 시작할 수 있습니다" {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, game)
}

func (h *LadderHandler) GetActiveGame(c *gin.Context) {
	userID, ok := util.GetUserIDFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "인증이 필요합니다"})
		return
	}

	game, err := h.Service.GetActiveGame(userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "참여 중인 게임이 없습니다"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, game)
}

func (h *LadderHandler) DeleteGame(c *gin.Context) {
	userID, ok := util.GetUserIDFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "인증이 필요합니다"})
		return
	}

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "잘못된 게임 ID 입니다"})
		return
	}

	if err := h.Service.DeleteGame(uint(id), userID); err != nil {
		if err.Error() == "방장만 삭제할 수 있습니다" {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}
