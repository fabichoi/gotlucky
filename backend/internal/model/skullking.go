package model

import "time"

type SkullKingGame struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time `json:"created_at"`
	IsActive  bool      `json:"is_active" gorm:"default:true"`
	Scores    []SkullKingScore `gorm:"foreignKey:GameID" json:"scores"`
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
