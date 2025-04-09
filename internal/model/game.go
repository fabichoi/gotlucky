package model

import "time"

type GameType struct {
	ID   uint   `gorm:"primaryKey"`
	Name string `gorm:"unique;not null"`
}

type GameSession struct {
	ID         uint      `gorm:"primaryKey"`
	Date       time.Time `gorm:"uniqueIndex"`
	GameTypeID uint
	GameType   GameType
}

type GameParticipant struct {
	ID            uint `gorm:"primaryKey"`
	GameSessionID uint `gorm:"index:idx_game_rank"`
	UserID        uint
	PointsUsed    int
	PointsEarned  int
	Rank          *int `gorm:"index:idx_game_rank,unique"`
}
