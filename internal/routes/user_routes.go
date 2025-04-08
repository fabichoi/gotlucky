package routes

import (
	"gotlucky/internal/handler"

	"github.com/gin-gonic/gin"
)

func RegisterUserRoutes(rg *gin.RouterGroup, userHandler *handler.UserHandler) {
	rg.POST("/users", userHandler.CreateUser)
}
