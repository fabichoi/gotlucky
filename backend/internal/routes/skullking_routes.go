package routes

import (
	"gotlucky/internal/handler"

	"github.com/gin-gonic/gin"
)

func RegisterSkullKingRoutes(rg *gin.RouterGroup, h *handler.SkullKingHandler) {
	sk := rg.Group("/skullking")
	{
		sk.POST("/game", h.CreateGame)
		sk.POST("/join", h.JoinRoom)
		sk.POST("/join/approve", h.ApproveJoinRequest)
		sk.POST("/join/reject", h.RejectJoinRequest)
		sk.POST("/start/:id", h.StartGame)
		sk.GET("/active", h.GetActiveGame)
		sk.GET("/rooms", h.ListWaitingRooms)
		sk.GET("/history", h.GetHistory)
		sk.POST("/score", h.UpdateScore)

		sk.POST("/end/:id", h.EndGame)
		sk.DELETE("/:id", h.DeleteGame)
	}
}
