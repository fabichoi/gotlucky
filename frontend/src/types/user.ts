export interface GameStats {
  total_games: number;
  win_count: number;
  total_points: number;
  average_points: number;
}

export interface UserStats {
  skull_king: GameStats;
  wizard: GameStats;
}
