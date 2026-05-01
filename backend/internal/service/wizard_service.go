package service

import (
	"crypto/rand"
	"errors"
	"gotlucky/internal/model"
	"math/big"
	"strings"

	"gorm.io/gorm"
)

type WizardService struct {
	DB *gorm.DB
}

func NewWizardService(db *gorm.DB) *WizardService {
	return &WizardService{DB: db}
}

func (s *WizardService) CreateGame(hostID uint) (*model.WizardGame, error) {
	// Deactivate any existing active game hosted by this user
	s.DB.Model(&model.WizardGame{}).Where("host_id = ? AND is_active = ?", hostID, true).Update("is_active", false)

	roomCode := s.generateRoomCode()

	game := &model.WizardGame{
		IsActive:    true,
		Status:      "waiting",
		HostID:      hostID,
		RoomCode:    roomCode,
		TotalRounds: 0,
	}

	if err := s.DB.Create(game).Error; err != nil {
		return nil, err
	}

	// Add host as the first player
	if err := s.AddPlayerToGame(game.ID, hostID); err != nil {
		return nil, err
	}

	return game, nil
}

func (s *WizardService) JoinRoom(userID uint, roomCode string) error {
	var game model.WizardGame
	roomCode = strings.ToUpper(roomCode)
	if err := s.DB.Where("room_code = ? AND is_active = ?", roomCode, true).Limit(1).Find(&game).Error; err != nil {
		return err
	}
	if game.ID == 0 {
		return errors.New("room not found or inactive")
	}

	// Check if already a participant
	var count int64
	s.DB.Model(&model.WizardScore{}).Where("game_id = ? AND user_id = ?", game.ID, userID).Count(&count)
	if count > 0 {
		return nil // Already joined
	}

	if game.Status == "playing" {
		// Create a join request instead of adding immediately
		var existingRequest model.WizardJoinRequest
		if err := s.DB.Where("game_id = ? AND user_id = ? AND status = ?", game.ID, userID, "pending").First(&existingRequest).Error; err == nil {
			return errors.New("join request already pending")
		}

		request := model.WizardJoinRequest{
			GameID: game.ID,
			UserID: userID,
			Status: "pending",
		}
		if err := s.DB.Create(&request).Error; err != nil {
			return err
		}
		return errors.New("request_sent: 방장의 승인을 기다리는 중입니다.")
	}

	if game.Status != "waiting" {
		return errors.New("game is already finished")
	}

	return s.AddPlayerToGame(game.ID, userID)
}

func (s *WizardService) ApproveJoinRequest(gameID, requesterID, userID uint) error {
	var game model.WizardGame
	if err := s.DB.Limit(1).Find(&game, gameID).Error; err != nil {
		return err
	}
	if game.ID == 0 || game.HostID != requesterID {
		return errors.New("only host can approve join requests")
	}

	var request model.WizardJoinRequest
	if err := s.DB.Where("game_id = ? AND user_id = ? AND status = ?", gameID, userID, "pending").Limit(1).Find(&request).Error; err != nil {
		return err
	}
	if request.ID == 0 {
		return errors.New("request not found")
	}

	return s.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&request).Update("status", "approved").Error; err != nil {
			return err
		}
		return s.AddPlayerToGameWithDB(tx, gameID, userID)
	})
}

func (s *WizardService) RejectJoinRequest(gameID, requesterID, userID uint) error {
	var game model.WizardGame
	if err := s.DB.First(&game, gameID).Error; err != nil {
		return err
	}
	if game.HostID != requesterID {
		return errors.New("only host can reject join requests")
	}

	return s.DB.Model(&model.WizardJoinRequest{}).
		Where("game_id = ? AND user_id = ? AND status = ?", gameID, userID, "pending").
		Update("status", "rejected").Error
}

func (s *WizardService) StartGame(gameID, requesterID uint) error {
	var game model.WizardGame
	if err := s.DB.First(&game, gameID).Error; err != nil {
		return err
	}

	if game.HostID != requesterID {
		return errors.New("only room manager can start the game")
	}

	// Count current participants
	var participantCount int64
	if err := s.DB.Model(&model.WizardScore{}).
		Where("game_id = ?", gameID).
		Distinct("user_id").
		Count(&participantCount).Error; err != nil {
		return err
	}

	if participantCount == 0 {
		return errors.New("no participants in the game")
	}

	totalRounds := 60 / int(participantCount)
	if totalRounds < 1 {
		totalRounds = 1
	}

	return s.DB.Transaction(func(tx *gorm.DB) error {
		// Update game status and total_rounds
		if err := tx.Model(&model.WizardGame{}).
			Where("id = ?", gameID).
			Updates(map[string]interface{}{
				"status":       "playing",
				"total_rounds": totalRounds,
			}).Error; err != nil {
			return err
		}

		// Trim any pre-existing scores beyond total_rounds (initial scores were created up to 20)
		if err := tx.Where("game_id = ? AND round > ?", gameID, totalRounds).
			Delete(&model.WizardScore{}).Error; err != nil {
			return err
		}

		return nil
	})
}

func (s *WizardService) AddPlayerToGame(gameID, userID uint) error {
	return s.AddPlayerToGameWithDB(s.DB, gameID, userID)
}

func (s *WizardService) AddPlayerToGameWithDB(db *gorm.DB, gameID, userID uint) error {
	// Determine total rounds: use stored TotalRounds if set, else max 20
	var game model.WizardGame
	if err := db.Select("total_rounds").First(&game, gameID).Error; err != nil {
		return err
	}

	totalRounds := game.TotalRounds
	if totalRounds <= 0 {
		totalRounds = 20
	}

	// Find current completed rounds in this game to mark them as missed for the new player
	var completedRounds []int
	db.Model(&model.WizardScore{}).
		Where("game_id = ? AND actual != ?", gameID, -1).
		Pluck("DISTINCT round", &completedRounds)

	isMissed := make(map[int]bool)
	for _, r := range completedRounds {
		isMissed[r] = true
	}

	// Initialize scores for all rounds for this player
	for round := 1; round <= totalRounds; round++ {
		actual := -1
		if isMissed[round] {
			actual = -2 // Mark as missed
		}

		score := model.WizardScore{
			GameID: gameID,
			Round:  round,
			UserID: userID,
			Bid:    0,
			Actual: actual,
			Points: 0,
		}
		if err := db.Create(&score).Error; err != nil {
			return err
		}
	}
	return nil
}

func (s *WizardService) generateRoomCode() string {
	const charset = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // Exclude confusing chars like O, 0, I, 1
	code := make([]byte, 6)
	for i := range code {
		num, _ := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
		code[i] = charset[num.Int64()]
	}
	return string(code)
}

func (s *WizardService) GetActiveGame(userID uint, isAdmin bool) (*model.WizardGame, error) {
	var game model.WizardGame

	// Find game where user is host or participant
	if err := s.DB.Where("host_id = ? AND is_active = ?", userID, true).Limit(1).Find(&game).Error; err != nil {
		return nil, err
	}

	if game.ID == 0 {
		// If not a host, check if user is a participant of an active game
		var score model.WizardScore
		if err := s.DB.Joins("JOIN wizard_games ON wizard_games.id = wizard_scores.game_id").
			Where("wizard_scores.user_id = ? AND wizard_games.is_active = ?", userID, true).
			Limit(1).Find(&score).Error; err != nil {
			return nil, err
		}

		if score.ID == 0 {
			// admin: fall back to any active game
			if isAdmin {
				if err := s.DB.Where("is_active = ?", true).Order("created_at desc").Limit(1).Find(&game).Error; err != nil {
					return nil, err
				}
				if game.ID == 0 {
					return nil, gorm.ErrRecordNotFound
				}
			} else {
				return nil, gorm.ErrRecordNotFound
			}
		} else {
			if err := s.DB.Where("id = ?", score.GameID).First(&game).Error; err != nil {
				return nil, err
			}
		}
	}

	// Load scores and users
	if err := s.DB.Preload("Scores.User").
		Preload("Host").
		Preload("JoinRequests", "status = ?", "pending").
		Preload("JoinRequests.User").
		Where("id = ?", game.ID).First(&game).Error; err != nil {
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

func (s *WizardService) UpdateScore(gameID, userID, requesterID uint, round, bid, actual int) error {
	var game model.WizardGame
	if err := s.DB.First(&game, gameID).Error; err != nil {
		return err
	}

	// Only host can update score
	if game.HostID != requesterID {
		return errors.New("only room manager can update scores")
	}

	var score model.WizardScore
	err := s.DB.Where("game_id = ? AND user_id = ? AND round = ?", gameID, userID, round).First(&score).Error
	if err != nil {
		return err
	}

	score.Bid = bid
	score.Actual = actual
	score.Points = calculateWizardPoints(bid, actual)

	return s.DB.Save(&score).Error
}

func calculateWizardPoints(bid, actual int) int {
	if actual == -1 {
		return 0
	}
	if actual == -2 {
		return 0
	}
	if bid == actual {
		return 20 + actual*10
	}
	diff := bid - actual
	if diff < 0 {
		diff = -diff
	}
	return -diff * 10
}

func (s *WizardService) GetHistory() ([]model.WizardGame, error) {
	var games []model.WizardGame
	err := s.DB.Preload("Scores.User").Where("is_active = ?", false).Order("created_at desc").Find(&games).Error
	return games, err
}

func (s *WizardService) DeleteGame(gameID, requesterID uint) error {
	var game model.WizardGame
	if err := s.DB.First(&game, gameID).Error; err != nil {
		return err
	}
	if game.HostID != requesterID {
		return errors.New("only host can delete the game")
	}

	return s.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("game_id = ?", gameID).Delete(&model.WizardScore{}).Error; err != nil {
			return err
		}
		if err := tx.Where("game_id = ?", gameID).Delete(&model.WizardJoinRequest{}).Error; err != nil {
			return err
		}
		if err := tx.Delete(&model.WizardGame{}, gameID).Error; err != nil {
			return err
		}
		return nil
	})
}

func (s *WizardService) EndGame(gameID, requesterID uint) error {
	var game model.WizardGame
	if err := s.DB.First(&game, gameID).Error; err != nil {
		return err
	}

	if game.HostID != requesterID {
		return errors.New("only room manager can end the game")
	}

	return s.DB.Model(&model.WizardGame{}).Where("id = ?", gameID).Update("is_active", false).Error
}

func (s *WizardService) ListWaitingRooms() ([]model.WizardGame, error) {
	var games []model.WizardGame
	err := s.DB.Preload("Host").Preload("Scores.User").
		Where("status IN (?) AND is_active = ?", []string{"waiting", "playing"}, true).
		Order("created_at desc").Find(&games).Error
	return games, err
}
