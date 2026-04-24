package service

import (
	"errors"
	"gotlucky/internal/model"
	"gotlucky/internal/repository"
	"gotlucky/internal/util"
	"time"
)

type AuthService struct {
	userRepo   *repository.UserRepository
	authRepo   *repository.AuthRepository
	inviteRepo *repository.InviteRepository
}

func NewAuthService(ur *repository.UserRepository, ar *repository.AuthRepository, ir *repository.InviteRepository) *AuthService {
	return &AuthService{ur, ar, ir}
}

func (s *AuthService) Register(name, email, password, inviteCode string) error {
	// Validate invite code
	invite, err := s.inviteRepo.GetUnusedCode(inviteCode)
	if err != nil {
		return errors.New("유효하지 않거나 이미 사용된 초대 코드입니다.")
	}

	hashedPassword, err := util.HashPassword(password)
	if err != nil {
		return err
	}

	user := &model.User{
		Name:     name,
		Email:    email,
		Password: hashedPassword,
	}

	if err := s.userRepo.CreateUser(user); err != nil {
		return err
	}

	// Mark invite code as used
	return s.inviteRepo.MarkAsUsed(invite.Code, user.ID)
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
