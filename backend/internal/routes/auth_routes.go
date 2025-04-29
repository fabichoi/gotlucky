package routes

import (
	"gotlucky/internal/handler"

	"github.com/gin-gonic/gin"
)

func RegisterAuthRoutes(rg *gin.RouterGroup, authHandler *handler.AuthHandler) {
	rg.POST("/signup", authHandler.Signup)
	rg.POST("/login", authHandler.Login)
}
