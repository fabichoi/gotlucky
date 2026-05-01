export interface LadderUser {
  id: number;
  name: string;
}

export interface LadderParticipant {
  id: number;
  game_id: number;
  user_id: number;
  user: LadderUser;
  position: number;
}

export interface LadderResult {
  id: number;
  game_id: number;
  label: string;
  position: number;
  winner_user_id: number | null;
}

export interface LadderData {
  columns: number;
  rows: number;
  rungs: boolean[][];
  result_map: Record<string, number>;
}

export interface LadderGame {
  id: number;
  room_code: string;
  host_id: number;
  host: LadderUser;
  status: 'waiting' | 'running' | 'finished';
  is_active: boolean;
  ladder_data: string;
  started_at: string | null;
  created_at: string;
  participants: LadderParticipant[];
  results: LadderResult[];
}
