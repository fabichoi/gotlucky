package repository

import (
	"gotlucky/internal/model"

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
	err := r.db.First(&user, id).Error
	return &user, err
}

func (r *UserRepository) UpdateUser(user *model.User) error {
	return r.db.Save(user).Error
}

func (r *UserRepository) SaveResult(result *model.LotteryResult) error {
	return r.db.Create(result).Error
}

func (r *UserRepository) CreateUser(user *model.User) error {
	return r.db.Create(user).Error
}
