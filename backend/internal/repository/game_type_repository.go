package repository

import (
	"gotlucky/internal/model"

	"gorm.io/gorm"
)

type GameTypeRepository struct {
	db *gorm.DB
}

func NewGameTypeRepository(db *gorm.DB) *GameTypeRepository {
	return &GameTypeRepository{db: db}
}

func (r *GameTypeRepository) Create(gt *model.GameType) error {
	return r.db.Create(gt).Error
}

func (r *GameTypeRepository) FindAll() ([]model.GameType, error) {
	var types []model.GameType
	err := r.db.Find(&types).Error
	return types, err
}

func (r *GameTypeRepository) FindByID(id uint) (*model.GameType, error) {
	var gt model.GameType
	err := r.db.First(&gt, id).Error
	return &gt, err
}

func (r *GameTypeRepository) DeleteGameTypeByID(id string) error {
	return r.db.Delete(&model.GameType{}, id).Error
}
