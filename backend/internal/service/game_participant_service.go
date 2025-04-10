package service

import (
	"gotlucky/internal/model"
	"gotlucky/internal/repository"
)

type GameParticipantService struct {
	repo *repository.GameParticipantRepository
}

func NewGameParticipantService(r *repository.GameParticipantRepository) *GameParticipantService {
	return &GameParticipantService{repo: r}
}

func (s *GameParticipantService) AddParticipant(p *model.GameParticipant) error {
	return s.repo.Create(p)
}

func (s *GameParticipantService) GetParticipantsBySession(sessionID uint) ([]model.GameParticipant, error) {
	return s.repo.FindAllBySessionID(sessionID)
}

func (s *GameParticipantService) GetParticipant(sessionID, participantID uint) (*model.GameParticipant, error) {
	return s.repo.FindByID(sessionID, participantID)
}

func (s *GameParticipantService) SetRanks(sessionID uint, ranked map[uint]int) error {
	return s.repo.SetRanks(sessionID, ranked)
}
