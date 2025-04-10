package routes

import (
	"gotlucky/internal/handler"

	"github.com/gin-gonic/gin"
)

func RegisterGameSessionRoutes(rg *gin.RouterGroup, h *handler.GameSessionHandler) {
	rg.POST("/games/sessions", h.CreateGameSession)
	rg.GET("/games/sessions", h.ListGameSessions)
	rg.GET("/games/sessions/:id", h.GetGameSession)
}
