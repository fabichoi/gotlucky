package database

import (
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type DBConfig struct {
	Path string
}

func Connect(cfg DBConfig) (*gorm.DB, error) {
	db, err := gorm.Open(sqlite.Open(cfg.Path), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	return db, nil
}
