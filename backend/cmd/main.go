package main

import (
	"gotlucky/internal/database"
	"gotlucky/internal/model"
	"gotlucky/internal/routes"
	"gotlucky/internal/util"
	"log"
	"os"

	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println(".env 파일 로드 실패 (무시하고 계속 진행)")
	}

	cfg := database.DBConfig{
		Path: os.Getenv("DB_PATH"),
	}

	db, err := database.Connect(cfg)
	if err != nil {
		panic("DB 연결 실패: " + err.Error())
	}

	if err := db.AutoMigrate(
		&model.User{},
		&model.AuthToken{},
		&model.GameType{},
		&model.GameSession{},
		&model.GameResult{},
		&model.LotteryType{},
		&model.LotteryResult{},
		&model.SkullKingGame{},
		&model.SkullKingScore{},
		&model.InviteCode{},
	); err != nil {
		panic("AutoMigrate 실패: " + err.Error())
	}

	util.SeedUsers(db)

	r := routes.SetupRouter(db)
	r.Run(":8080")

}
