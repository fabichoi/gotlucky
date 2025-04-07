package model

import "time"

type User struct {
	ID     uint `gorm:"primaryKey"`
	Name   string
	Points int
}

type LotteryResult struct {
	ID        uint `gorm:"primaryKey"`
	UserID    uint
	Result    string
	CreatedAt time.Time
}
