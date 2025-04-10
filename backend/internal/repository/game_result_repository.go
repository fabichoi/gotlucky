package repository

import (
	"gotlucky/internal/model"

	"gorm.io/gorm"
)

type GameResultRepository struct {
	db *gorm.DB
}

func NewGameResultRepository(db *gorm.DB) *GameResultRepository {
	return &GameResultRepository{db: db}
}

func (r *GameResultRepository) CreateMany(p []*model.GameResult) error {
	return r.db.Create(p).Error
}

func (r *GameResultRepository) FindAllBySessionID(sessionID uint) ([]model.GameResult, error) {
	var gameResults []model.GameResult
	err := r.db.Where("game_session_id = ?", sessionID).Find(&gameResults).Error
	return gameResults, err
}

func (r *GameResultRepository) FindByID(sessionID, gameResultID uint) (*model.GameResult, error) {
	var p model.GameResult
	err := r.db.Where("game_session_id = ? AND id = ?", sessionID, gameResultID).First(&p).Error
	return &p, err
}
