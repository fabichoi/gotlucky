package handler

import (
	"gotlucky/internal/service"
	"gotlucky/internal/util"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type LotteryHandler struct {
	lotteryService *service.LotteryService
}

func NewLotteryHandler(ls *service.LotteryService) *LotteryHandler {
	return &LotteryHandler{
		lotteryService: ls,
	}
}

type LotteryRequest struct {
	LotteryType uint `json:"lottery_type,omitempty"`
}

type LotteryResponse struct {
	Earned     int       `json:"earned"`
	LastPlayed time.Time `json:"lastPlayed,omitempty"`
	Error      string    `json:"error,omitempty"`
}

func (h *LotteryHandler) PlayLottery(c *gin.Context) {
	userID, exists := util.GetUserIDFromContext(c)

	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req LotteryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		req = LotteryRequest{}
	}

	lotteryType := uint(1)
	if req.LotteryType > 0 {
		lotteryType = req.LotteryType
	}

	// 추첨 진행
	earned, err := h.lotteryService.Play(userID, lotteryType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, LotteryResponse{
		Earned:     int(earned),
		LastPlayed: time.Now(),
	})
}

func (h *LotteryHandler) GetLastPlayedLotteryInfo(c *gin.Context) {
	userID, exists := util.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req LotteryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		req = LotteryRequest{}
	}

	lotteryType := uint(1)
	if req.LotteryType > 0 {
		lotteryType = req.LotteryType
	}

	lastPlayed, earned, err := h.lotteryService.GetLastPlayedLotteryTime(userID, lotteryType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"lastPlayed": lastPlayed, "earned": earned})
}
