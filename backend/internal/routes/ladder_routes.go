package routes

import (
	"gotlucky/internal/handler"

	"github.com/gin-gonic/gin"
)

func RegisterLadderRoutes(rg *gin.RouterGroup, h *handler.LadderHandler) {
	ld := rg.Group("/ladder")
	{
		ld.POST("/game", h.CreateGame)
		ld.GET("/rooms", h.ListRooms)
		ld.POST("/join", h.JoinRoom)
		ld.POST("/start/:id", h.StartGame)
		ld.GET("/active", h.GetActiveGame)
		ld.DELETE("/:id", h.DeleteGame)
	}
}
