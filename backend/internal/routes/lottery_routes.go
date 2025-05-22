package routes

import (
	"gotlucky/internal/handler"

	"github.com/gin-gonic/gin"
)

func RegisterLotteryRoutes(rg *gin.RouterGroup, h *handler.LotteryHandler) {
	rg.POST("/lottery/play", h.PlayLottery)
	rg.GET("/lottery/last-played", h.GetLastPlayedLotteryInfo)
}
