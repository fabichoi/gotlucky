package dto

type GameStats struct {
	TotalGames    int     `json:"total_games"`
	AverageRank   float64 `json:"average_rank"`
	TotalPoints   int     `json:"total_points"`
	AveragePoints float64 `json:"average_points"`
}

type UserStats struct {
	SkullKing GameStats `json:"skull_king"`
	Wizard    GameStats `json:"wizard"`
}
