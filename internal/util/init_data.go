package util

import (
	"gotlucky/internal/model"

	"gorm.io/gorm"
)

func SeedUsers(db *gorm.DB) error {
	users := []model.User{
		{Name: "Fabi", Points: 100},
		{Name: "Juryung", Points: 80},
		{Name: "Kangha", Points: 60},
		{Name: "DanWoo", Points: 55},
		{Name: "Munho", Points: 75},
	}

	for _, u := range users {
		if err := db.Create(&u).Error; err != nil {
			return err
		}
	}

	return nil
}
