package dto

type GameResultInput struct {
	UserID       uint `json:"user_id"`
	PointsEarned int  `json:"points_earned"`
	Rank         *int `json:"rank"`
}
