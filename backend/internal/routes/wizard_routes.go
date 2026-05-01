package routes

import (
	"gotlucky/internal/handler"

	"github.com/gin-gonic/gin"
)

func RegisterWizardRoutes(rg *gin.RouterGroup, h *handler.WizardHandler) {
	wz := rg.Group("/wizard")
	{
		wz.POST("/game", h.CreateGame)
		wz.POST("/join", h.JoinRoom)
		wz.POST("/join/approve", h.ApproveJoinRequest)
		wz.POST("/join/reject", h.RejectJoinRequest)
		wz.POST("/start/:id", h.StartGame)
		wz.GET("/active", h.GetActiveGame)
		wz.GET("/rooms", h.ListWaitingRooms)
		wz.GET("/history", h.GetHistory)
		wz.POST("/score", h.UpdateScore)

		wz.POST("/end/:id", h.EndGame)
		wz.DELETE("/:id", h.DeleteGame)
	}
}
