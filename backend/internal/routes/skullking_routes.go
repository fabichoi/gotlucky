package routes

import (
	"gotlucky/internal/handler"

	"github.com/gin-gonic/gin"
)

func RegisterSkullKingRoutes(rg *gin.RouterGroup, h *handler.SkullKingHandler) {
	sk := rg.Group("/skullking")
	{
		sk.POST("/game", h.CreateGame)
		sk.GET("/active", h.GetActiveGame)
		sk.GET("/history", h.GetHistory)
		sk.POST("/score", h.UpdateScore)
		sk.POST("/player", h.AddPlayer)
		sk.POST("/end/:id", h.EndGame)
		sk.DELETE("/:id", h.DeleteGame)
	}
}
