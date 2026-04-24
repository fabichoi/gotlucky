package util

import (
	"gotlucky/internal/model"
	"gorm.io/gorm"
	"log"
)

func SeedUsers(db *gorm.DB) error {
	password, _ := HashPassword("password123")

	users := []model.User{
		{Name: "관리자", Email: "admin@gotlucky.com", Password: password, Role: "admin", IsActive: true},
		{Name: "유저1", Email: "user1@gotlucky.com", Password: password, Role: "user", IsActive: true},
		{Name: "유저2", Email: "user2@gotlucky.com", Password: password, Role: "user", IsActive: true},
		{Name: "유저3", Email: "user3@gotlucky.com", Password: password, Role: "user", IsActive: true},
		{Name: "유저4", Email: "user4@gotlucky.com", Password: password, Role: "user", IsActive: true},
		{Name: "유저5", Email: "user5@gotlucky.com", Password: password, Role: "user", IsActive: true},
		{Name: "유저6", Email: "user6@gotlucky.com", Password: password, Role: "user", IsActive: true},
		{Name: "유저7", Email: "user7@gotlucky.com", Password: password, Role: "user", IsActive: true},
		{Name: "유저8", Email: "user8@gotlucky.com", Password: password, Role: "user", IsActive: true},
	}

	for _, u := range users {
		var existing model.User
		if err := db.Where("email = ?", u.Email).First(&existing).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				if err := db.Create(&u).Error; err != nil {
					log.Printf("Failed to seed user %s: %v", u.Email, err)
				} else {
					log.Printf("Seeded user: %s", u.Email)
				}
			}
		}
	}

	return nil
}
