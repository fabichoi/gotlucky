package main

import (
	"gotlucky/internal/model"
	"gotlucky/internal/routes"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func main() {
	db, err := gorm.Open(sqlite.Open("lottery.db"), &gorm.Config{})
	if err != nil {
		panic("DB 연결 실패")
	}

	db.AutoMigrate(
		&model.User{},
		&model.LotteryResult{},
		&model.GameType{},
		&model.GameSession{},
		&model.GameResult{},
	)

	// if err := util.SeedUsers(db); err != nil {
	// 	panic("Init Failed: " + err.Error())
	// }

	r := routes.SetupRouter(db)
	r.Run(":8080")

}
