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

	api := r.Group("/api/v1")

	userRepo := repository.NewUserRepository(db)
	userService := service.NewUserService(userRepo)
	userHandler := handler.NewUserHandler(userService)
	RegisterUserRoutes(api, userHandler)

	lottoService := service.NewLotteryService(userRepo)
	lottoHandler := handler.NewLotteryHandler(lottoService)
	RegisterLotteryRoutes(api, lottoHandler)

	gameTypeRepo := repository.NewGameTypeRepository(db)
	gameTypeService := service.NewGameTypeService(gameTypeRepo)
	gameTypeHandler := handler.NewGameTypeHandler(gameTypeService)
	RegisterGameTypeRoutes(api, gameTypeHandler)

	gameSessionRepo := repository.NewGameSessionRepository(db)
	gameSessionService := service.NewGameSessionService(gameSessionRepo)
	gameSessionHandler := handler.NewGameSessionHandler(gameSessionService)
	RegisterGameSessionRoutes(api, gameSessionHandler)

	return r
}
