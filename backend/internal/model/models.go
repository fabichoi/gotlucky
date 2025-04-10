package model

import "time"

type User struct {
	ID     uint   `gorm:"primaryKey" json:"id"`
	Name   string `json:"name"`
	Points int    `json:"points"`
}

type LotteryResult struct {
	ID        uint `gorm:"primaryKey"`
	UserID    uint
	Result    string
	CreatedAt time.Time
}
