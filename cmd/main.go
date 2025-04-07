package main

import (
	"gotlucky/internal/handler"
	"gotlucky/internal/model"
	"gotlucky/internal/repository"
	"gotlucky/internal/service"
	"gotlucky/internal/util"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func main() {
	db, err := gorm.Open(sqlite.Open("lottery.db"), &gorm.Config{})
	if err != nil {
		panic("DB 연결 실패")
	}

	db.AutoMigrate(&model.User{}, &model.LotteryResult{})

	userRepo := repository.NewUserRepository(db)

	userService := service.NewUserService(userRepo)
	userHandler := handler.NewUserHandler(userService)

	lottoService := service.NewLotteryService(userRepo)
	lottoHandler := handler.NewLotteryHandler(lottoService)

	if err := util.SeedUsers(db); err != nil {
		panic("Init Failed: " + err.Error())
	}

	r := gin.Default()

	r.POST("/users", userHandler.CreateUser)
	r.POST("/lottery/:id", lottoHandler.ParticipateLottery)

	r.Run(":8080")

}
