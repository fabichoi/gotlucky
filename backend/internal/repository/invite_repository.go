package repository

import (
	"gotlucky/internal/model"
	"gorm.io/gorm"
)

type InviteRepository struct {
	db *gorm.DB
}

func NewInviteRepository(db *gorm.DB) *InviteRepository {
	return &InviteRepository{db}
}

func (r *InviteRepository) GetUnusedCode(code string) (*model.InviteCode, error) {
	var invite model.InviteCode
	err := r.db.Where("code = ? AND is_used = ?", code, false).First(&invite).Error
	if err != nil {
		return nil, err
	}
	return &invite, nil
}

func (r *InviteRepository) MarkAsUsed(code string, userID uint) error {
	return r.db.Model(&model.InviteCode{}).Where("code = ?", code).Updates(map[string]interface{}{
		"is_used": true,
		"used_by": userID,
	}).Error
}

func (r *InviteRepository) CreateCode(code *model.InviteCode) error {
	return r.db.Create(code).Error
}

func (r *InviteRepository) GetAllCodes() ([]model.InviteCode, error) {
	var codes []model.InviteCode
	err := r.db.Preload("User").Order("created_at desc").Find(&codes).Error
	return codes, err
}
