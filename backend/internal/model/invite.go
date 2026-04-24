package model

import "time"

type InviteCode struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Code      string    `gorm:"unique;not null" json:"code"`
	IsUsed    bool      `gorm:"default:false" json:"is_used"`
	UsedBy    *uint     `json:"used_by,omitempty"`
	User      *User     `gorm:"foreignKey:UsedBy" json:"user,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}
