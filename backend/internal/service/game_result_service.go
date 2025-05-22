package service

import (
	"gotlucky/internal/model"
	"gotlucky/internal/repository"
)

type GameResultService struct {
	repo        *repository.GameResultRepository
	sessionRepo *repository.GameSessionRepository
}

func NewGameResultService(r *repository.GameResultRepository, s *repository.GameSessionRepository) *GameResultService {
	return &GameResultService{repo: r, sessionRepo: s}
}

func (s *GameResultService) AddGameResult(p []*model.GameResult) error {
	return s.repo.CreateMany(p)
}

func (s *GameResultService) GetGameSession(id uint) (*model.GameSession, error) {
	return s.sessionRepo.FindByID(id)
}

func (s *GameResultService) GetGameResultsBySession(sessionID uint) ([]model.GameResult, error) {
	return s.repo.FindAllBySessionID(sessionID)
}

func (s *GameResultService) GetGameResult(sessionID, gameResultID uint) (*model.GameResult, error) {
	return s.repo.FindByID(sessionID, gameResultID)
}
