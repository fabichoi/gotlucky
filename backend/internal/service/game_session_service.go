package service

import (
	"gotlucky/internal/model"
	"gotlucky/internal/repository"
)

type GameSessionService struct {
	repo *repository.GameSessionRepository
}

func NewGameSessionService(r *repository.GameSessionRepository) *GameSessionService {
	return &GameSessionService{repo: r}
}

func (s *GameSessionService) CreateGameSession(session *model.GameSession) error {
	return s.repo.Create(session)
}

func (s *GameSessionService) GetAllGameSessions() ([]model.GameSession, error) {
	return s.repo.FindAll()
}

func (s *GameSessionService) GetGameSessionByID(id uint) (*model.GameSession, error) {
	return s.repo.FindByID(id)
}

func (s *GameSessionService) DeleteGameSessionByID(id string) error {
	return s.repo.DeleteGameSessionByID(id)
}
