package main

import (
	"gotlucky/internal/database"
	"gotlucky/internal/model"
	"gotlucky/internal/routes"
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
		User:     os.Getenv("DB_USER"),
		Password: os.Getenv("DB_PASSWORD"),
		Host:     os.Getenv("DB_HOST"),
		Port:     os.Getenv("DB_PORT"),
		Name:     os.Getenv("DB_NAME"),
	}

	db, err := database.Connect(cfg)
	if err != nil {
		panic("DB 연결 실패: " + err.Error())
	}

	if err := db.AutoMigrate(
		&model.User{},
		&model.GameType{},
		&model.GameSession{},
		&model.GameResult{},
	); err != nil {
		panic("AutoMigrate 실패: " + err.Error())
	}

	r := routes.SetupRouter(db)
	r.Run(":8080")

}
