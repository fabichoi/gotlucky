package model

import "time"

type WizardGame struct {
	ID           uint                 `gorm:"primaryKey" json:"id"`
	CreatedAt    time.Time            `json:"created_at"`
	IsActive     bool                 `json:"is_active" gorm:"default:true"`
	Status       string               `json:"status" gorm:"default:'waiting'"` // waiting, playing, finished
	RoomCode     string               `json:"room_code" gorm:"uniqueIndex;size:10"`
	HostID       uint                 `json:"host_id"`
	Host         User                 `gorm:"foreignKey:HostID" json:"host"`
	TotalRounds  int                  `json:"total_rounds" gorm:"default:0"`
	Scores       []WizardScore        `gorm:"foreignKey:GameID" json:"scores"`
	JoinRequests []WizardJoinRequest  `gorm:"foreignKey:GameID" json:"join_requests"`
}

type WizardJoinRequest struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	GameID    uint      `json:"game_id" gorm:"index"`
	UserID    uint      `json:"user_id"`
	User      User      `gorm:"foreignKey:UserID" json:"user"`
	Status    string    `json:"status" gorm:"default:'pending'"` // pending, approved, rejected
	CreatedAt time.Time `json:"created_at"`
}

type WizardScore struct {
	ID     uint `gorm:"primaryKey" json:"id"`
	GameID uint `json:"game_id" gorm:"index"`
	Round  int  `json:"round"`
	UserID uint `json:"user_id"`
	User   User `gorm:"foreignKey:UserID" json:"user"`
	Bid    int  `json:"bid"`
	Actual int  `json:"actual" gorm:"default:-1"` // -1=not yet recorded, -2=missed (joined late)
	Points int  `json:"points"`
}
