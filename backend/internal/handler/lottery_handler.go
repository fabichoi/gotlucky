package handler

import (
	"gotlucky/internal/service"
	"gotlucky/internal/util"
	"net/http"

	"github.com/gin-gonic/gin"
)

type LotteryHandler struct {
	lotteryService *service.LotteryService
	userService    *service.UserService
}

func NewLotteryHandler(ls *service.LotteryService, us *service.UserService) *LotteryHandler {
	return &LotteryHandler{
		lotteryService: ls,
		userService:    us,
	}
}

func (h *LotteryHandler) PlayLottery(c *gin.Context) {
	userID, exists := util.GetUserIDFromContext(c)

	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "로그인 필요"})
		return
	}

	user, err := h.userService.GetUserById(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "사용자 조회 실패"})
		return
	}

	result, err := h.lotteryService.Play(user)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"result":           result,
		"remaining_points": user.Points,
	})
}
