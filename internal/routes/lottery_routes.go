package routes

import (
	"gotlucky/internal/handler"

	"github.com/gin-gonic/gin"
)

func RegisterLotteryRoutes(rg *gin.RouterGroup, lotteryHandler *handler.LotteryHandler) {
	rg.POST("/lottery/:id", lotteryHandler.ParticipateLottery)
}
