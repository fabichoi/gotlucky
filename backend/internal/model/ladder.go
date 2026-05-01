package model

import "time"

type LadderGame struct {
	ID           uint                `gorm:"primaryKey" json:"id"`
	RoomCode     string              `gorm:"uniqueIndex;size:10;not null" json:"room_code"`
	HostID       uint                `json:"host_id"`
	Host         User                `gorm:"foreignKey:HostID" json:"host"`
	Status       string              `gorm:"default:'waiting'" json:"status"` // waiting, running, finished
	IsActive     bool                `gorm:"default:true" json:"is_active"`
	LadderData   string              `gorm:"type:text" json:"ladder_data"` // JSON 인코딩, 게임 시작 전까지 빈 문자열
	StartedAt    *time.Time          `json:"started_at"`
	CreatedAt    time.Time           `json:"created_at"`
	Participants []LadderParticipant `gorm:"foreignKey:GameID" json:"participants"`
	Results      []LadderResult      `gorm:"foreignKey:GameID" json:"results"`
}

type LadderParticipant struct {
	ID       uint `gorm:"primaryKey" json:"id"`
	GameID   uint `gorm:"index" json:"game_id"`
	UserID   uint `json:"user_id"`
	User     User `gorm:"foreignKey:UserID" json:"user"`
	Position int  `gorm:"default:-1" json:"position"` // 게임 시작 시 배정, -1은 미배정
}

type LadderResult struct {
	ID           uint   `gorm:"primaryKey" json:"id"`
	GameID       uint   `gorm:"index" json:"game_id"`
	Label        string `json:"label"`            // 예: "커피 사기", "벌칙", "면제"
	Position     int    `json:"position"`         // 열 인덱스 (0-based), 게임 시작 시 배정
	WinnerUserID *uint  `json:"winner_user_id"`   // 게임 종료 시 채워짐
}
