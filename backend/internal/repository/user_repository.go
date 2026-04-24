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
