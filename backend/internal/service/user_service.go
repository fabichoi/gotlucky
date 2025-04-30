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

func (s *UserService) GetAllUsers() ([]model.User, error) {
	return s.repo.GetAllUsers()
}

func (s *UserService) GetUserById(id uint) (*model.User, error) {
	return s.repo.GetUserById(id)
}

func (s *UserService) DeleteUserByID(id string) error {
	return s.repo.DeleteUserByID(id)
}

func (s *UserService) UpdateUserByID(id string, updated *model.User) (*model.User, error) {
	user, err := s.repo.UpdateUserByID(id, updated)
	return user, err
}
