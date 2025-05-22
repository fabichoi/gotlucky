package model

import "time"

type LotteryType struct {
	ID   uint   `gorm:"primaryKey" json:"id"`
	Name string `gorm:"unique;not null" json:"name"`
}

type LotteryResult struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Type      uint      `gorm:"index;" json:"type"`
	UserID    uint      `gorm:"index;" json:"user_id"`
	Paid      uint      `gorm:"default:0" json:"paid"`
	Earned    uint      `gorm:"default:0" json:"earned"`
	CreatedAt time.Time `json:"created_at"`
}
