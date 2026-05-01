package repository

import (
	"errors"
	"gotlucky/internal/dto"
	"gotlucky/internal/model"
	"gotlucky/internal/util"

	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db}
}

func (r *UserRepository) GetUserById(id uint) (*model.User, error) {
	var user model.User
	if err := r.db.First(&user, id).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) GetUserByEmail(email string) (*model.User, error) {
	var user model.User
	if err := r.db.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) UpdateUser(user *model.User) error {
	return r.db.Save(user).Error
}

func (r *UserRepository) CreateUser(user *model.User) error {
	return r.db.Create(user).Error
}

func (r *UserRepository) GetAllUsers() ([]model.User, error) {
	var users []model.User
	err := r.db.Find(&users).Error
	return users, err
}

func (r *UserRepository) DeleteUserByID(id string) error {
	return r.db.Delete(&model.User{}, id).Error
}

func (r *UserRepository) UpdateUserByID(id string, updated *dto.UpdateUserInput) (*model.User, error) {
	var user model.User
	if err := r.db.First(&user, id).Error; err != nil {
		return nil, err
	}

	if updated.Name != "" {
		user.Name = updated.Name
	}

	if updated.Email != "" {
		user.Email = updated.Email
	}

	if updated.NewPassword != "" && updated.OldPassword != "" {
		// 현재 비밀번호가 일치하는지 확인
		if util.CheckPasswordHash(updated.OldPassword, user.Password) {
			// 새 비밀번호 해싱
			hashedPassword, err := util.HashPassword(updated.NewPassword)
			if err != nil {
				return nil, err
			}
			user.Password = hashedPassword
		} else {
			return nil, errors.New("현재 비밀번호가 일치하지 않습니다")
		}
	}

	if err := r.db.Save(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) GetUserStats(userID uint) (*dto.UserStats, error) {
	var stats dto.UserStats

	// Skull King Stats
	var skResults []struct {
		GameID uint
		UserID uint
		Total  int
	}
	
	// Get all finished games where the user participated
	var skGameIDs []uint
	r.db.Model(&model.SkullKingScore{}).
		Joins("JOIN skull_king_games ON skull_king_games.id = skull_king_scores.game_id").
		Where("skull_king_scores.user_id = ? AND skull_king_games.is_active = ?", userID, false).
		Distinct("skull_king_scores.game_id").
		Pluck("skull_king_scores.game_id", &skGameIDs)

	if len(skGameIDs) > 0 {
		stats.SkullKing.TotalGames = len(skGameIDs)
		
		r.db.Model(&model.SkullKingScore{}).
			Select("game_id, user_id, SUM(points) as total").
			Where("game_id IN ?", skGameIDs).
			Group("game_id, user_id").
			Scan(&skResults)

		userScores := make(map[uint]int)
		gameRanks := make(map[uint]int)

		for _, res := range skResults {
			if res.UserID == userID {
				userScores[res.GameID] = res.Total
				stats.SkullKing.TotalPoints += res.Total
				gameRanks[res.GameID] = 1
			}
		}

		for _, res := range skResults {
			if res.UserID != userID {
				if userScore, ok := userScores[res.GameID]; ok {
					if res.Total > userScore {
						gameRanks[res.GameID]++
					}
				}
			}
		}

		totalRank := 0
		for _, rank := range gameRanks {
			totalRank += rank
		}
		
		if stats.SkullKing.TotalGames > 0 {
			stats.SkullKing.AverageRank = float64(totalRank) / float64(stats.SkullKing.TotalGames)
			stats.SkullKing.AveragePoints = float64(stats.SkullKing.TotalPoints) / float64(stats.SkullKing.TotalGames)
		}
	}

	// Wizard Stats
	var wizResults []struct {
		GameID uint
		UserID uint
		Total  int
	}
	
	var wizGameIDs []uint
	r.db.Model(&model.WizardScore{}).
		Joins("JOIN wizard_games ON wizard_games.id = wizard_scores.game_id").
		Where("wizard_scores.user_id = ? AND wizard_games.is_active = ?", userID, false).
		Distinct("wizard_scores.game_id").
		Pluck("wizard_scores.game_id", &wizGameIDs)

	if len(wizGameIDs) > 0 {
		stats.Wizard.TotalGames = len(wizGameIDs)
		
		r.db.Model(&model.WizardScore{}).
			Select("game_id, user_id, SUM(points) as total").
			Where("game_id IN ?", wizGameIDs).
			Group("game_id, user_id").
			Scan(&wizResults)

		userWizScores := make(map[uint]int)
		gameWizRanks := make(map[uint]int)

		for _, res := range wizResults {
			if res.UserID == userID {
				userWizScores[res.GameID] = res.Total
				stats.Wizard.TotalPoints += res.Total
				gameWizRanks[res.GameID] = 1
			}
		}

		for _, res := range wizResults {
			if res.UserID != userID {
				if userScore, ok := userWizScores[res.GameID]; ok {
					if res.Total > userScore {
						gameWizRanks[res.GameID]++
					}
				}
			}
		}

		totalWizRank := 0
		for _, rank := range gameWizRanks {
			totalWizRank += rank
		}
		
		if stats.Wizard.TotalGames > 0 {
			stats.Wizard.AverageRank = float64(totalWizRank) / float64(stats.Wizard.TotalGames)
			stats.Wizard.AveragePoints = float64(stats.Wizard.TotalPoints) / float64(stats.Wizard.TotalGames)
		}
	}

	return &stats, nil
}
