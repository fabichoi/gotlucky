package model

import "time"

type SkullKingGame struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	CreatedAt    time.Time `json:"created_at"`
	IsActive     bool      `json:"is_active" gorm:"default:true"`
	Status       string    `json:"status" gorm:"default:'waiting'"` // waiting, playing, finished
	RoomCode     string    `json:"room_code" gorm:"uniqueIndex"`
	HostID       uint      `json:"host_id"`
	Host         User      `gorm:"foreignKey:HostID" json:"host"`
	Scores       []SkullKingScore       `gorm:"foreignKey:GameID" json:"scores"`
	JoinRequests []SkullKingJoinRequest `gorm:"foreignKey:GameID" json:"join_requests"`
}

type SkullKingJoinRequest struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	GameID    uint      `json:"game_id" gorm:"index"`
	UserID    uint      `json:"user_id"`
	User      User      `gorm:"foreignKey:UserID" json:"user"`
	Status    string    `json:"status" gorm:"default:'pending'"` // pending, approved, rejected
	CreatedAt time.Time `json:"created_at"`
}

type SkullKingScore struct {
	ID      uint `gorm:"primaryKey" json:"id"`
	GameID  uint `json:"game_id" gorm:"index"`
	Round   int  `json:"round"`
	UserID  uint `json:"user_id"`
	User    User `gorm:"foreignKey:UserID" json:"user"`
	Bid     int  `json:"bid"`
	Actual  int  `json:"actual" gorm:"default:-1"` // -1 means not yet recorded
	Points  int  `json:"points"`
	Bonus   int  `json:"bonus"`
}
