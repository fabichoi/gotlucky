package routes

import (
	"gotlucky/internal/handler"

	"github.com/gin-gonic/gin"
)

func RegisterGameResultRoutes(rg *gin.RouterGroup, h *handler.GameResultHandler) {
	rg.POST("/games/:id/results", h.AddGameResult)
	rg.GET("/games/:id/results", h.GetGameResults)
	rg.GET("/games/:id/results/:p_id", h.GetGameResult)
}
