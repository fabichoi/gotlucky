package repository

import (
	"gotlucky/internal/model"
	"time"

	"gorm.io/gorm"
)

type LotteryRepository struct {
	db *gorm.DB
}

func NewLotteryRepository(db *gorm.DB) *LotteryRepository {
	return &LotteryRepository{db}
}

func (r *LotteryRepository) Create(result *model.LotteryResult) error {
	return r.db.Create(result).Error
}

func (r *LotteryRepository) GetAllLotteryResult() ([]model.LotteryResult, error) {
	var lotteryResults []model.LotteryResult
	err := r.db.Find(&lotteryResults).Error
	return lotteryResults, err
}

func (r *LotteryRepository) GetLastPlayedLotteryTime(userID uint, lotteryType uint) (*time.Time, uint, error) {
	var result model.LotteryResult
	err := r.db.Where("user_id = ? AND type = ?", userID, lotteryType).
		Order("created_at desc").
		First(&result).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, 0, nil
		}
		return nil, 0, err
	}
	return &result.CreatedAt, result.Earned, nil
}
