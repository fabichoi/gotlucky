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

export interface JoinRequest {
  id: number;
  game_id: number;
  user_id: number;
  user: User;
  status: 'pending' | 'approved' | 'rejected';
}

export interface SkullKingGame {
  id: number;
  is_active: boolean;
  status: 'waiting' | 'playing' | 'finished';
  room_code: string;
  created_at: string;
  host_id: number;
  host?: User;
  scores: PlayerScore[];
  join_requests?: JoinRequest[];
}

export interface PlayerTotal {
  id: number;
  name: string;
  total: number;
}
