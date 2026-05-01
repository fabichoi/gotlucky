export interface GameStats {
  total_games: number;
  average_rank: number;
  total_points: number;
  average_points: number;
}

export interface UserStats {
  skull_king: GameStats;
  wizard: GameStats;
}
