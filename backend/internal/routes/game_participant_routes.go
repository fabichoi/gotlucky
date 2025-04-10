package routes

import (
	"gotlucky/internal/handler"

	"github.com/gin-gonic/gin"
)

func RegisterParticipantRoutes(rg *gin.RouterGroup, h *handler.GameParticipantHandler) {
	rg.POST("/games/:id/participants", h.AddParticipant)
	rg.GET("/games/:id/participants", h.GetParticipants)
	rg.GET("/games/:id/participants/:p_id", h.GetParticipant)
	rg.POST("/games/:id/results", h.SetResult)
}
