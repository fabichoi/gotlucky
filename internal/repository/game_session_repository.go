package repository

import (
	"gotlucky/internal/model"

	"gorm.io/gorm"
)

type GameSessionRepository struct {
	db *gorm.DB
}

func NewGameSessionRepository(db *gorm.DB) *GameSessionRepository {
	return &GameSessionRepository{db: db}
}

func (r *GameSessionRepository) Create(session *model.GameSession) error {
	return r.db.Create(session).Error
}

func (r *GameSessionRepository) FindAll() ([]model.GameSession, error) {
	var sessions []model.GameSession
	err := r.db.Preload("GameType").Find(&sessions).Error
	return sessions, err
}

func (r *GameSessionRepository) FindByID(id uint) (*model.GameSession, error) {
	var session model.GameSession
	err := r.db.Preload("GameType").First(&session, id).Error
	return &session, err
}
