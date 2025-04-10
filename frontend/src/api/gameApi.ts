const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export async function fetchGameTypes() {
  const res = await fetch(`${API_BASE_URL}/api/v1/games/types`);
  return res.json();
}

export async function createGameType(name: string) {
  const res = await fetch(`${API_BASE_URL}/api/v1/games/types`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
  return res.json();
}

export async function createGameSession(date: string, game_type_id: number) {
  const res = await fetch(`${API_BASE_URL}/api/v1/games/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ date, game_type_id }),
  });
  return res.json();
}

export async function submitGameResults(
  sessionId: number,
  payload: { user_id: number; rank: number; points_earned: number }[]
) {
  const res = await fetch(`${API_BASE_URL}/api/v1/games/${sessionId}/results`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return res.json();
}
