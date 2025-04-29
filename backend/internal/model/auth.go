package model

import "time"

type AuthToken struct {
	ID        uint      `gorm:"primaryKey"`
	UserID    uint      `gorm:"index;not null"`
	Token     string    `gorm:"uniqueIndex;size:512;not null"`
	ExpiresAt time.Time `gorm:"index"`
	CreatedAt time.Time
}
