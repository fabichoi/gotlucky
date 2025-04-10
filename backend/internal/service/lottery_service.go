package service

import (
	"errors"
	"gotlucky/internal/model"
	"gotlucky/internal/repository"
	"math/rand"
	"time"
)

type LotteryService struct {
	repo *repository.UserRepository
}

func NewLotteryService(repo *repository.UserRepository) *LotteryService {
	return &LotteryService{repo}
}

func (s *LotteryService) Play(userID uint) (*model.LotteryResult, error) {
	user, err := s.repo.GetUserById(userID)
	if err != nil {
		return nil, errors.New("user is not existed")
	}

	if user.Points < 10 {
		return nil, errors.New("point is not enough")
	}

	rand.Seed(time.Now().UnixNano())
	win := rand.Intn(10) == 0

	result := "LOSE"
	if win {
		result = "WIN"
	}

	user.Points -= 10
	_ = s.repo.UpdateUser(user)

	res := &model.LotteryResult{
		UserID:    user.ID,
		Result:    result,
		CreatedAt: time.Now(),
	}

	_ = s.repo.SaveResult(res)

	return res, nil
}
