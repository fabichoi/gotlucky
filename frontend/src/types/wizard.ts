export interface WizardUser {
  id: number;
  name: string;
  role?: string;
}

export interface WizardScore {
  id?: number;
  game_id: number;
  user_id: number;
  round: number;
  bid: number;
  actual: number;  // -1=미입력, -2=불참
  points: number;
  user: WizardUser;
}

export interface WizardJoinRequest {
  id: number;
  game_id: number;
  user_id: number;
  user: WizardUser;
  status: 'pending' | 'approved' | 'rejected';
}

export interface WizardGame {
  id: number;
  room_code: string;
  host_id: number;
  host?: WizardUser;
  status: 'waiting' | 'playing' | 'finished';
  is_active: boolean;
  total_rounds: number;
  created_at: string;
  scores: WizardScore[];
  join_requests?: WizardJoinRequest[];
}

export interface WizardPlayerTotal {
  id: number;
  name: string;
  total: number;
}
