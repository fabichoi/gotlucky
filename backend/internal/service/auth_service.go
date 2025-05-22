package service

import (
	"errors"
	"gotlucky/internal/model"
	"gotlucky/internal/repository"
	"gotlucky/internal/util"
	"time"
)

type AuthService struct {
	userRepo *repository.UserRepository
	authRepo *repository.AuthRepository
}

func NewAuthService(ur *repository.UserRepository, ar *repository.AuthRepository) *AuthService {
	return &AuthService{ur, ar}
}

func (s *AuthService) Register(email, password string) error {
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

	expiresAt := time.Now().Add(72 * time.Hour)

	authToken := model.AuthToken{
		UserID:    user.ID,
		Token:     token,
		ExpiresAt: expiresAt,
	}

	s.authRepo.SaveToken(&authToken)

	return token, nil
}
