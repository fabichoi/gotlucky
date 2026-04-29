package service

import (
	"errors"
	"gotlucky/internal/model"
	"gorm.io/gorm"
)

type SkullKingService struct {
	DB *gorm.DB
}

func NewSkullKingService(db *gorm.DB) *SkullKingService {
	return &SkullKingService{DB: db}
}

func (s *SkullKingService) CreateGame(playerIDs []uint) (*model.SkullKingGame, error) {
	// Deactivate any existing active game
	s.DB.Model(&model.SkullKingGame{}).Where("is_active = ?", true).Update("is_active", false)

	game := &model.SkullKingGame{
		IsActive: true,
	}

	if err := s.DB.Create(game).Error; err != nil {
		return nil, err
	}

	// Initialize scores for all 10 rounds for all players
	for round := 1; round <= 10; round++ {
		for _, userID := range playerIDs {
			score := model.SkullKingScore{
				GameID: game.ID,
				Round:  round,
				UserID: userID,
				Bid:    0,
				Actual: -1, // Not recorded yet
			}
			if err := s.DB.Create(&score).Error; err != nil {
				return nil, err
			}
		}
	}

	return game, nil
}

func (s *SkullKingService) GetActiveGame(userID uint, isAdmin bool) (*model.SkullKingGame, error) {
	var game model.SkullKingGame
	// Use Find instead of First to avoid "record not found" logs
	if err := s.DB.Where("is_active = ?", true).Limit(1).Find(&game).Error; err != nil {
		return nil, err
	}
	if game.ID == 0 {
		return nil, gorm.ErrRecordNotFound
	}

	// Load scores and users
	if err := s.DB.Preload("Scores.User").Where("id = ?", game.ID).First(&game).Error; err != nil {
		return nil, err
	}

	// If not admin, check if user is in the game
	if !isAdmin {
		isInGame := false
		for _, score := range game.Scores {
			if score.UserID == userID {
				isInGame = true
				break
			}
		}
		if !isInGame {
			return nil, errors.New("not a participant of the active game")
		}
	}

	return &game, nil
}

func (s *SkullKingService) UpdateScore(gameID, userID uint, round, bid, actual, bonus int) error {
	var score model.SkullKingScore
	err := s.DB.Where("game_id = ? AND user_id = ? AND round = ?", gameID, userID, round).First(&score).Error
	if err != nil {
		return err
	}

	score.Bid = bid
	score.Actual = actual
	score.Bonus = bonus
	score.Points = calculatePoints(round, bid, actual, bonus)

	return s.DB.Save(&score).Error
}

func calculatePoints(round, bid, actual, bonus int) int {
	if actual == -1 {
		return 0
	}
	if bid == actual {
		if bid == 0 {
			return round * 10
		}
		return bid*20 + bonus
	}
	// Bid != Actual
	diff := bid - actual
	if diff < 0 {
		diff = -diff
	}
	if bid == 0 {
		return -round * 10
	}
	return -diff * 10
}

func (s *SkullKingService) GetHistory() ([]model.SkullKingGame, error) {
	var games []model.SkullKingGame
	err := s.DB.Preload("Scores.User").Where("is_active = ?", false).Order("created_at desc").Find(&games).Error
	return games, err
}

func (s *SkullKingService) DeleteGame(gameID uint) error {
	return s.DB.Transaction(func(tx *gorm.DB) error {
		// Delete scores first
		if err := tx.Where("game_id = ?", gameID).Delete(&model.SkullKingScore{}).Error; err != nil {
			return err
		}
		// Delete game
		if err := tx.Delete(&model.SkullKingGame{}, gameID).Error; err != nil {
			return err
		}
		return nil
	})
}



func (s *SkullKingService) EndGame(gameID uint) error {
	return s.DB.Model(&model.SkullKingGame{}).Where("id = ?", gameID).Update("is_active", false).Error
}
