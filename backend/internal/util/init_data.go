package util

import (
	"gotlucky/internal/model"

	"gorm.io/gorm"
)

func SeedUsers(db *gorm.DB) error {
	users := []model.User{
		{Name: "admin", Email: "admin@fabichoi.xyz", Role: "admin", IsActive: true},
	}

	for _, u := range users {
		if err := db.Create(&u).Error; err != nil {
			return err
		}
	}

	return nil
}
