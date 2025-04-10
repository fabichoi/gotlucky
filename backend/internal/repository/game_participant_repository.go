package repository

import (
	"gotlucky/internal/model"

	"gorm.io/gorm"
)

type GameParticipantRepository struct {
	db *gorm.DB
}

func NewGameParticipantRepository(db *gorm.DB) *GameParticipantRepository {
	return &GameParticipantRepository{db: db}
}

func (r *GameParticipantRepository) Create(p *model.GameParticipant) error {
	return r.db.Create(p).Error
}

func (r *GameParticipantRepository) FindAllBySessionID(sessionID uint) ([]model.GameParticipant, error) {
	var participants []model.GameParticipant
	err := r.db.Where("game_session_id = ?", sessionID).Find(&participants).Error
	return participants, err
}

func (r *GameParticipantRepository) FindByID(sessionID, participantID uint) (*model.GameParticipant, error) {
	var p model.GameParticipant
	err := r.db.Where("game_session_id = ? AND id = ?", sessionID, participantID).First(&p).Error
	return &p, err
}

func (r *GameParticipantRepository) SetRanks(sessionID uint, rankedIDs map[uint]int) error {
	for id, rank := range rankedIDs {
		if err := r.db.Model(&model.GameParticipant{}).
			Where("game_session_id = ? AND user_id = ?", sessionID, id).
			Update("rank", rank).Error; err != nil {
			return err
		}
	}
	return nil
}
