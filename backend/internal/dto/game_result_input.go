package dto

type GameResultInput struct {
	UserID       uint `json:"user_id"`
	Rank         int  `json:"rank"`
	PointsEarned int  `json:"points_earned"`
}
