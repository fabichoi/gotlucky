package routes

import (
	"gotlucky/internal/handler"

	"github.com/gin-gonic/gin"
)

func RegisterAuthRoutes(rg *gin.RouterGroup, h *handler.AuthHandler) {
	rg.POST("/auth/register", h.Register)
	rg.POST("/auth/login", h.Login)
}
