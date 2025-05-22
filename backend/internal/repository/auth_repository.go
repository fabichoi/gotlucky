package repository

import (
	"gotlucky/internal/model"

	"gorm.io/gorm"
)

type AuthRepository struct {
	db *gorm.DB
}

func NewAuthRepository(db *gorm.DB) *AuthRepository {
	return &AuthRepository{db}
}

func (r *AuthRepository) SaveToken(token *model.AuthToken) error {
	return r.db.Create(token).Error
}
