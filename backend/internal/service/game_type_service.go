package service

import (
	"gotlucky/internal/model"
	"gotlucky/internal/repository"
)

type GameTypeService struct {
	repo *repository.GameTypeRepository
}

func NewGameTypeService(r *repository.GameTypeRepository) *GameTypeService {
	return &GameTypeService{repo: r}
}

func (s *GameTypeService) CreateGameType(gt *model.GameType) error {
	return s.repo.Create(gt)
}

func (s *GameTypeService) GetAllGameTypes() ([]model.GameType, error) {
	return s.repo.FindAll()
}

func (s *GameTypeService) GetGameTypeByID(id uint) (*model.GameType, error) {
	return s.repo.FindByID(id)
}

func (s *GameTypeService) DeleteGameTypeByID(id string) error {
	return s.repo.DeleteGameTypeByID(id)
}
