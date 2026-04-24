package routes

import (
	"gotlucky/internal/handler"
	"gotlucky/internal/middleware"
	"gotlucky/internal/repository"
	"gotlucky/internal/service"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRouter(db *gorm.DB) *gin.Engine {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		// AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
		AllowAllOrigins:  true,
	}))
	r.Use(middleware.AuthMiddleware(db))

	api := r.Group("/v1")

	userRepo := repository.NewUserRepository(db)
	userService := service.NewUserService(userRepo)
	userHandler := handler.NewUserHandler(userService)
	RegisterUserRoutes(api, userHandler)

	gameTypeRepo := repository.NewGameTypeRepository(db)
	gameTypeService := service.NewGameTypeService(gameTypeRepo)
	gameTypeHandler := handler.NewGameTypeHandler(gameTypeService)
	RegisterGameTypeRoutes(api, gameTypeHandler)

	gameSessionRepo := repository.NewGameSessionRepository(db)
	gameSessionService := service.NewGameSessionService(gameSessionRepo)
	gameSessionHandler := handler.NewGameSessionHandler(gameSessionService)
	RegisterGameSessionRoutes(api, gameSessionHandler)

	gameResultRepo := repository.NewGameResultRepository(db)
	gameResultService := service.NewGameResultService(gameResultRepo, gameSessionRepo)
	gameResultHandler := handler.NewGameResultHandler(gameResultService)
	RegisterGameResultRoutes(api, gameResultHandler)

	authRepo := repository.NewAuthRepository(db)
	inviteRepo := repository.NewInviteRepository(db)
	authService := service.NewAuthService(userRepo, authRepo, inviteRepo)
	authHandler := handler.NewAuthHandler(authService)
	RegisterAuthRoutes(api, authHandler)

	inviteHandler := handler.NewInviteHandler(inviteRepo)
	api.POST("/admin/invites", inviteHandler.GenerateCode)
	api.GET("/admin/invites", inviteHandler.ListCodes)

	lotteryRepo := repository.NewLotteryRepository(db)
	lotteryService := service.NewLotteryService(userRepo, lotteryRepo)
	lotteryHandler := handler.NewLotteryHandler(lotteryService)
	RegisterLotteryRoutes(api, lotteryHandler)

	skullKingService := service.NewSkullKingService(db)
	skullKingHandler := handler.NewSkullKingHandler(skullKingService)
	RegisterSkullKingRoutes(api, skullKingHandler)

	return r
}
