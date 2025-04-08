package routes

import (
	"gotlucky/internal/handler"
	"gotlucky/internal/repository"
	"gotlucky/internal/service"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRouter(db *gorm.DB) *gin.Engine {
	r := gin.Default()

	userRepo := repository.NewUserRepository(db)

	userService := service.NewUserService(userRepo)
	userHandler := handler.NewUserHandler(userService)

	lottoService := service.NewLotteryService(userRepo)
	lottoHandler := handler.NewLotteryHandler(lottoService)

	api := r.Group("/api/v1")

	RegisterUserRoutes(api, userHandler)
	RegisterLotteryRoutes(api, lottoHandler)

	return r
}
