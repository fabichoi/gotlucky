package service

import (
	"crypto/rand"
	"errors"
	"gotlucky/internal/model"
	"math/big"
	"strings"

	"gorm.io/gorm"
)

type SkullKingService struct {
	DB *gorm.DB
}

func NewSkullKingService(db *gorm.DB) *SkullKingService {
	return &SkullKingService{DB: db}
}

func (s *SkullKingService) CreateGame(hostID uint) (*model.SkullKingGame, error) {
	// Deactivate any existing active game hosted by this user
	s.DB.Model(&model.SkullKingGame{}).Where("host_id = ? AND is_active = ?", hostID, true).Update("is_active", false)

	roomCode := s.generateRoomCode()

	game := &model.SkullKingGame{
		IsActive: true,
		Status:   "waiting",
		HostID:   hostID,
		RoomCode: roomCode,
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

func (s *SkullKingService) JoinRoom(userID uint, roomCode string) error {
	var game model.SkullKingGame
	roomCode = strings.ToUpper(roomCode)
	if err := s.DB.Where("room_code = ? AND is_active = ?", roomCode, true).Limit(1).Find(&game).Error; err != nil {
		return err
	}
	if game.ID == 0 {
		return errors.New("room not found or inactive")
	}

	// Check if already a participant
	var count int64
	s.DB.Model(&model.SkullKingScore{}).Where("game_id = ? AND user_id = ?", game.ID, userID).Count(&count)
	if count > 0 {
		return nil // Already joined
	}

	if game.Status == "playing" {
		// Create a join request instead of adding immediately
		var existingRequest model.SkullKingJoinRequest
		if err := s.DB.Where("game_id = ? AND user_id = ? AND status = ?", game.ID, userID, "pending").First(&existingRequest).Error; err == nil {
			return errors.New("join request already pending")
		}

		request := model.SkullKingJoinRequest{
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

func (s *SkullKingService) ApproveJoinRequest(gameID, requesterID, userID uint) error {
	var game model.SkullKingGame
	if err := s.DB.Limit(1).Find(&game, gameID).Error; err != nil {
		return err
	}
	if game.ID == 0 || game.HostID != requesterID {
		return errors.New("only host can approve join requests")
	}

	var request model.SkullKingJoinRequest
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

func (s *SkullKingService) RejectJoinRequest(gameID, requesterID, userID uint) error {
	var game model.SkullKingGame
	if err := s.DB.First(&game, gameID).Error; err != nil {
		return err
	}
	if game.HostID != requesterID {
		return errors.New("only host can reject join requests")
	}

	return s.DB.Model(&model.SkullKingJoinRequest{}).
		Where("game_id = ? AND user_id = ? AND status = ?", gameID, userID, "pending").
		Update("status", "rejected").Error
}

func (s *SkullKingService) StartGame(gameID, requesterID uint) error {
	var game model.SkullKingGame
	if err := s.DB.First(&game, gameID).Error; err != nil {
		return err
	}

	if game.HostID != requesterID {
		return errors.New("only room manager can start the game")
	}

	return s.DB.Model(&game).Update("status", "playing").Error
}

func (s *SkullKingService) AddPlayerToGame(gameID, userID uint) error {
	return s.AddPlayerToGameWithDB(s.DB, gameID, userID)
}

func (s *SkullKingService) AddPlayerToGameWithDB(db *gorm.DB, gameID, userID uint) error {
	// Find current completed rounds in this game to mark them as missed for the new player
	var completedRounds []int
	db.Model(&model.SkullKingScore{}).
		Where("game_id = ? AND actual != ?", gameID, -1).
		Pluck("DISTINCT round", &completedRounds)

	isMissed := make(map[int]bool)
	for _, r := range completedRounds {
		isMissed[r] = true
	}

	// Initialize scores for all 10 rounds for this player
	for round := 1; round <= 10; round++ {
		actual := -1
		if isMissed[round] {
			actual = -2 // Mark as missed
		}

		score := model.SkullKingScore{
			GameID: gameID,
			Round:  round,
			UserID: userID,
			Bid:    0,
			Actual: actual,
			Points: 0,
			Bonus:  0,
		}
		if err := db.Create(&score).Error; err != nil {
			return err
		}
	}
	return nil
}

func (s *SkullKingService) generateRoomCode() string {
	const charset = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // Exclude confusing chars like O, 0, I, 1
	code := make([]byte, 6)
	for i := range code {
		num, _ := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
		code[i] = charset[num.Int64()]
	}
	return string(code)
}

func (s *SkullKingService) GetActiveGame(userID uint, isAdmin bool) (*model.SkullKingGame, error) {
	var game model.SkullKingGame
	
	// Find game where user is host or participant
	// First, check if user is a host of an active game (waiting or playing)
	if err := s.DB.Where("host_id = ? AND is_active = ?", userID, true).Limit(1).Find(&game).Error; err != nil {
		return nil, err
	}

	if game.ID == 0 {
		// If not a host, check if user is a participant of an active game
		var score model.SkullKingScore
		if err := s.DB.Joins("JOIN skull_king_games ON skull_king_games.id = skull_king_scores.game_id").
			Where("skull_king_scores.user_id = ? AND skull_king_games.is_active = ?", userID, true).
			Limit(1).Find(&score).Error; err != nil {
			return nil, err
		}
		
		if score.ID == 0 {
			return nil, gorm.ErrRecordNotFound
		}

		if err := s.DB.Where("id = ?", score.GameID).First(&game).Error; err != nil {
			return nil, err
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

func (s *SkullKingService) UpdateScore(gameID, userID, requesterID uint, round, bid, actual, bonus int) error {
	var game model.SkullKingGame
	if err := s.DB.First(&game, gameID).Error; err != nil {
		return err
	}

	// Only host can update score
	if game.HostID != requesterID {
		return errors.New("only room manager can update scores")
	}

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

func (s *SkullKingService) DeleteGame(gameID, requesterID uint) error {
	var game model.SkullKingGame
	if err := s.DB.First(&game, gameID).Error; err != nil {
		return err
	}
	if game.HostID != requesterID {
		return errors.New("only host can delete the game")
	}

	return s.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("game_id = ?", gameID).Delete(&model.SkullKingScore{}).Error; err != nil {
			return err
		}
		if err := tx.Delete(&model.SkullKingGame{}, gameID).Error; err != nil {
			return err
		}
		return nil
	})
}



func (s *SkullKingService) EndGame(gameID, requesterID uint) error {
	var game model.SkullKingGame
	if err := s.DB.First(&game, gameID).Error; err != nil {
		return err
	}

	if game.HostID != requesterID {
		return errors.New("only room manager can end the game")
	}

	return s.DB.Model(&model.SkullKingGame{}).Where("id = ?", gameID).Update("is_active", false).Error
}

func (s *SkullKingService) ListWaitingRooms() ([]model.SkullKingGame, error) {
	var games []model.SkullKingGame
	err := s.DB.Preload("Host").Preload("Scores.User").
		Where("status IN (?) AND is_active = ?", []string{"waiting", "playing"}, true).
		Order("created_at desc").Find(&games).Error
	return games, err
}
