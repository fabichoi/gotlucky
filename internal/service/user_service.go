package service

import (
	"gotlucky/internal/model"
	"gotlucky/internal/repository"
)

type UserService struct {
	repo *repository.UserRepository
}

func NewUserService(r *repository.UserRepository) *UserService {
	return &UserService{r}
}

func (s *UserService) CreateUser(user *model.User) (*model.User, error) {
	err := s.repo.CreateUser(user)
	return user, err
}
