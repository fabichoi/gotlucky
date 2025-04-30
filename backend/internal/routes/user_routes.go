package routes

import (
	"gotlucky/internal/handler"

	"github.com/gin-gonic/gin"
)

func RegisterUserRoutes(rg *gin.RouterGroup, userHandler *handler.UserHandler) {
	rg.POST("/users", userHandler.CreateUser)
	rg.GET("/users", userHandler.GetUsers)
	rg.PUT("/users/:id", userHandler.UpdateUser)
	rg.DELETE("/users/:id", userHandler.DeleteUser)
	rg.GET("/me", userHandler.GetMe)
}
