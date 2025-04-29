package service

import (
	"errors"
	"gotlucky/internal/model"
	"gotlucky/internal/repository"
	"gotlucky/internal/util"
)

type AuthService struct {
	userRepo *repository.UserRepository
}

func NewAuthService(userRepo *repository.UserRepository) *AuthService {
	return &AuthService{userRepo}
}

func (s *AuthService) Signup(email, password string) error {
	hashedPassword, err := util.HashPassword(password)

	if err != nil {
		return err
	}

	user := &model.User{
		Email:    email,
		Password: hashedPassword,
	}

	return s.userRepo.CreateUser(user)
}

func (s *AuthService) Login(email, password string) (string, error) {
	user, err := s.userRepo.GetUserByEmail(email)
	if err != nil {
		return "", errors.New("이메일 또는 비밀번호가 올바르지 않습니다.")
	}

	if !util.CheckPasswordHash(password, user.Password) {
		return "", errors.New("이메일 또는 비밀번호가 올바르지 않습니다.")
	}

	token, err := util.GenerateJWT(user.ID, user.Email)
	if err != nil {
		return "", errors.New("토큰 생성 실패")
	}

	return token, nil
}
