package service

import (
	"errors"
	"gotlucky/internal/model"
	"gotlucky/internal/repository"
	"math/rand"
)

type LotteryService struct {
	userRepo    *repository.UserRepository
	lotteryRepo *repository.LotteryRepository
}

func NewLotteryService(ur *repository.UserRepository, lr *repository.LotteryRepository) *LotteryService {
	return &LotteryService{userRepo: ur, lotteryRepo: lr}
}

func (s *LotteryService) Play(user *model.User) (int, error) {
	const paid = 50

	if user.Points < paid {
		return 0, errors.New("Not enough to play")
	}

	earned := rand.Intn(101)
	changedPoint := 50 + earned

	user.Points -= uint(changedPoint)
	if err := s.userRepo.UpdateUser(user); err != nil {
		return 0, err
	}

	record := &model.LotteryResult{
		UserID: user.ID,
		Paid:   paid,
		Earned: uint(earned),
	}

	if err := s.lotteryRepo.Create(record); err != nil {
		return 0, err
	}

	return earned, nil
}
