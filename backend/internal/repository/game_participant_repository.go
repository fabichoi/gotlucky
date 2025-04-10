package repository

import (
	"gotlucky/internal/dto"
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

func (r *GameParticipantRepository) SetRanks(sessionID uint, ranked []dto.GameResultInput) error {
	for _, result := range ranked {
		err := r.db.Model(&model.GameParticipant{}).
			Where("game_session_id = ? AND user_id = ?", sessionID, result.UserID).
			Updates(map[string]interface{}{
				"rank":          result.Rank,
				"points_earned": result.PointsEarned,
			}).Error

		if err != nil {
			return err
		}
	}
	return nil
}

func (r *GameParticipantRepository) GetSessionWithResult(id uint) (*model.GameSession, error) {
	var session model.GameSession
	err := r.db.Preload("GameType").First(&session, id).Error
	return &session, err
}

func (r *GameParticipantRepository) GetParticipantsBySession(sessionID uint) ([]model.GameParticipant, error) {
	var participants []model.GameParticipant
	err := r.db.Where("game_session_id = ?", sessionID).Find(&participants).Error
	return participants, err
}
