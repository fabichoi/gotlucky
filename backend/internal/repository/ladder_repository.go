package repository

import (
	"gotlucky/internal/model"

	"gorm.io/gorm"
)

type LadderRepository struct {
	db *gorm.DB
}

func NewLadderRepository(db *gorm.DB) *LadderRepository {
	return &LadderRepository{db: db}
}

func (r *LadderRepository) DB() *gorm.DB {
	return r.db
}

func (r *LadderRepository) Create(game *model.LadderGame) error {
	return r.db.Create(game).Error
}

func (r *LadderRepository) Save(game *model.LadderGame) error {
	return r.db.Save(game).Error
}

func (r *LadderRepository) FindByID(id uint) (*model.LadderGame, error) {
	var game model.LadderGame
	err := r.db.First(&game, id).Error
	if err != nil {
		return nil, err
	}
	return &game, nil
}

func (r *LadderRepository) FindByIDPreloaded(id uint) (*model.LadderGame, error) {
	var game model.LadderGame
	err := r.db.
		Preload("Host").
		Preload("Participants.User").
		Preload("Results").
		First(&game, id).Error
	if err != nil {
		return nil, err
	}
	return &game, nil
}

func (r *LadderRepository) FindByRoomCode(roomCode string) (*model.LadderGame, error) {
	var game model.LadderGame
	err := r.db.Where("room_code = ? AND is_active = ?", roomCode, true).
		Preload("Participants").
		Preload("Results").
		First(&game).Error
	if err != nil {
		return nil, err
	}
	return &game, nil
}

func (r *LadderRepository) FindActiveByUser(userID uint) (*model.LadderGame, error) {
	var game model.LadderGame

	// 1. 호스트인 경우
	if err := r.db.Where("host_id = ? AND is_active = ?", userID, true).
		Limit(1).Find(&game).Error; err != nil {
		return nil, err
	}

	if game.ID == 0 {
		// 2. 참여자인 경우
		var participant model.LadderParticipant
		if err := r.db.
			Joins("JOIN ladder_games ON ladder_games.id = ladder_participants.game_id").
			Where("ladder_participants.user_id = ? AND ladder_games.is_active = ?", userID, true).
			Limit(1).Find(&participant).Error; err != nil {
			return nil, err
		}
		if participant.ID == 0 {
			return nil, gorm.ErrRecordNotFound
		}
		if err := r.db.First(&game, participant.GameID).Error; err != nil {
			return nil, err
		}
	}

	if err := r.db.
		Preload("Host").
		Preload("Participants.User").
		Preload("Results").
		First(&game, game.ID).Error; err != nil {
		return nil, err
	}

	return &game, nil
}

func (r *LadderRepository) ListRooms() ([]model.LadderGame, error) {
	var games []model.LadderGame
	err := r.db.
		Preload("Host").
		Preload("Participants.User").
		Preload("Results").
		Where("status IN (?) AND is_active = ?", []string{"waiting", "running"}, true).
		Order("created_at desc").
		Find(&games).Error
	return games, err
}

func (r *LadderRepository) AddParticipant(p *model.LadderParticipant) error {
	return r.db.Create(p).Error
}

func (r *LadderRepository) CountParticipants(gameID uint) (int64, error) {
	var count int64
	err := r.db.Model(&model.LadderParticipant{}).
		Where("game_id = ?", gameID).Count(&count).Error
	return count, err
}

func (r *LadderRepository) FindParticipant(gameID, userID uint) (*model.LadderParticipant, error) {
	var p model.LadderParticipant
	err := r.db.Where("game_id = ? AND user_id = ?", gameID, userID).First(&p).Error
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *LadderRepository) FindParticipants(gameID uint) ([]model.LadderParticipant, error) {
	var participants []model.LadderParticipant
	err := r.db.Where("game_id = ?", gameID).Find(&participants).Error
	return participants, err
}

func (r *LadderRepository) FindResults(gameID uint) ([]model.LadderResult, error) {
	var results []model.LadderResult
	err := r.db.Where("game_id = ?", gameID).Find(&results).Error
	return results, err
}

func (r *LadderRepository) CreateResult(result *model.LadderResult) error {
	return r.db.Create(result).Error
}

func (r *LadderRepository) DeleteGame(gameID uint) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("game_id = ?", gameID).Delete(&model.LadderResult{}).Error; err != nil {
			return err
		}
		if err := tx.Where("game_id = ?", gameID).Delete(&model.LadderParticipant{}).Error; err != nil {
			return err
		}
		if err := tx.Delete(&model.LadderGame{}, gameID).Error; err != nil {
			return err
		}
		return nil
	})
}
