package model

import "time"

type GameType struct {
	ID   uint   `gorm:"primaryKey" json:"id"`
	Name string `gorm:"unique;not null" json:"name"`
}

type GameSession struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	Date       time.Time `gorm:"uniqueIndex" json:"date"`
	GameTypeID uint      `json:"game_type_id"`
	GameType   GameType  `gorm:"foreignKey:GameTypeID" json:"game_type"`
}

type GameResult struct {
	ID            uint `gorm:"primaryKey" json:"id"`
	GameSessionID uint `gorm:"index:idx_game_rank" json:"game_session_id"`
	UserID        uint `json:"user_id"`
	PointsEarned  int  `json:"points_earned"`
	Rank          *int `gorm:"index:idx_game_rank,unique" json:"rank,omitempty"`
}
