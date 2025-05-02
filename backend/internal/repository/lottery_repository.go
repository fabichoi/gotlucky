package repository

import (
	"gotlucky/internal/model"

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
