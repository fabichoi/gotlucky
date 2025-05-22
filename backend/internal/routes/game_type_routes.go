package routes

import (
	"gotlucky/internal/handler"

	"github.com/gin-gonic/gin"
)

func RegisterGameTypeRoutes(rg *gin.RouterGroup, h *handler.GameTypeHandler) {
	rg.POST("/games/types", h.CreateGameType)
	rg.GET("/games/types", h.ListGameTypes)
	rg.GET("/games/types/:id", h.GetGameType)
	rg.DELETE("/games/types/:id", h.DeleteGameType)
}
