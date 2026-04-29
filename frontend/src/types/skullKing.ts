export interface User {
  id: number;
  name: string;
  email?: string;
  role?: string;
}

export interface PlayerScore {
  id?: number;
  game_id: number;
  user_id: number;
  round: number;
  bid: number;
  actual: number;
  points: number;
  bonus: number;
  user: User;
}

export interface SkullKingGame {
  id: number;
  is_active: boolean;
  created_at: string;
  scores: PlayerScore[];
}

export interface PlayerTotal {
  id: number;
  name: string;
  total: number;
}
