package service

import (
	"gotlucky/internal/model"
	"gotlucky/internal/repository"
)

type GameResultService struct {
	repo *repository.GameResultRepository
}

func NewGameResultService(r *repository.GameResultRepository) *GameResultService {
	return &GameResultService{repo: r}
}

func (s *GameResultService) AddGameResult(p []*model.GameResult) error {
	return s.repo.CreateMany(p)
}

func (s *GameResultService) GetGameResultsBySession(sessionID uint) ([]model.GameResult, error) {
	return s.repo.FindAllBySessionID(sessionID)
}

func (s *GameResultService) GetGameResult(sessionID, gameResultID uint) (*model.GameResult, error) {
	return s.repo.FindByID(sessionID, gameResultID)
}
