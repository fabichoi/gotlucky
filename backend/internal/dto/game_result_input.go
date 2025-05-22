package dto

import "gotlucky/internal/model"

type GameResultInput struct {
	UserID       uint `json:"user_id"`
	PointsEarned int  `json:"points_earned"`
	Rank         *int `json:"rank"`
}

type GameResultResponse struct {
	Game    model.GameSession  `json:"game"`
	Results []model.GameResult `json:"results"`
}
