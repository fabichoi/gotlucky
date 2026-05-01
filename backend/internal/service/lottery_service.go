package service

import (
	"errors"
	"gotlucky/internal/model"
	"gotlucky/internal/repository"
	"math/rand"
	"time"
)

type LotteryService struct {
	userRepo    *repository.UserRepository
	lotteryRepo *repository.LotteryRepository
}

func NewLotteryService(ur *repository.UserRepository, lr *repository.LotteryRepository) *LotteryService {
	return &LotteryService{userRepo: ur, lotteryRepo: lr}
}

func (s *LotteryService) Play(userID uint, lotteryType uint) (uint, error) {
	const paid = 50

	lastPlayed, _, err := s.GetLastPlayedLotteryTime(userID, lotteryType)
	if err != nil {
		return 0, err
	}

	if lastPlayed != nil {
		loc, _ := time.LoadLocation("Asia/Seoul")
		nowKST := time.Now().In(loc)
		lastKST := lastPlayed.In(loc)
		if nowKST.Year() == lastKST.Year() && nowKST.YearDay() == lastKST.YearDay() {
			return 0, errors.New("오늘은 이미 추첨하셨습니다. 자정이 지나면 다시 추첨할 수 있습니다")
		}
	}

	user, err := s.userRepo.GetUserById(userID)
	if err != nil {
		return 0, err
	}

	if user.Points < paid {
		return 0, errors.New("포인트가 부족합니다")
	}

	earned := uint(rand.Intn(101))

	user.Points -= paid
	user.Points += earned
	if err := s.userRepo.UpdateUser(user); err != nil {
		return 0, err
	}

	record := &model.LotteryResult{
		UserID: user.ID,
		Type:   lotteryType,
		Paid:   paid,
		Earned: earned,
	}

	if err := s.lotteryRepo.Create(record); err != nil {
		return 0, err
	}

	return earned, nil
}

func (s *LotteryService) GetLastPlayedLotteryTime(userID uint, lotteryType uint) (*time.Time, uint, error) {
	lastPlayed, earned, err := s.lotteryRepo.GetLastPlayedLotteryTime(userID, lotteryType)
	if err != nil {
		return nil, 0, err
	}
	return lastPlayed, earned, nil
}
