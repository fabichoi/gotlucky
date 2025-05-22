import { fetchWithAuth } from "./fetchWithAuth";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export async function fetchUsers() {
  const res = await fetchWithAuth(`${API_BASE_URL}/v1/users`);
  if (!res.ok) {
    throw new Error("유저 불러오기 실패");
  }
  return res.json();
}

export async function createUser(name: string) {
  const res = await fetchWithAuth(`${API_BASE_URL}/v1/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: name }),
  });
  if (!res.ok) {
    throw new Error("유저 추가 실패");
  }
  return res.json();
}

export async function deleteUser(id: number) {
  const res = await fetchWithAuth(`${API_BASE_URL}/v1/users/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error("유저 삭제 실패");
  }
}

export async function updateUser(
  id: number,
  payload: { name?: string; old_password?: string; new_password?: string }
) {
  const res = await fetchWithAuth(`${API_BASE_URL}/v1/users/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("유저 수정 실패");
  return res.json();
}

export async function fetchGameTypes() {
  const res = await fetchWithAuth(`${API_BASE_URL}/v1/games/types`);
  return res.json();
}

export async function createGameType(name: string) {
  const res = await fetchWithAuth(`${API_BASE_URL}/v1/games/types`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
  return res.json();
}

export async function deleteGameType(id: number) {
  const res = await fetchWithAuth(`${API_BASE_URL}/v1/games/types/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error("세션 삭제 실패");
  }
}

export async function updateGameType(id: number, name: string) {
  const res = await fetchWithAuth(`${API_BASE_URL}/v1/games/types/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
  return res.json();
}

export async function fetchGameSessions() {
  const res = await fetchWithAuth(`${API_BASE_URL}/v1/games/sessions`);
  return res.json();
}

export async function createGameSession(date: string, game_type_id: number) {
  const res = await fetchWithAuth(`${API_BASE_URL}/v1/games/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ date, game_type_id }),
  });
  return res.json();
}

export async function deleteGameSession(id: number) {
  const res = await fetchWithAuth(`${API_BASE_URL}/v1/games/sessions/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error("세션 삭제 실패");
  }
}

export async function updateGameSession(date: string, game_type_id: number) {
  const res = await fetchWithAuth(`${API_BASE_URL}/v1/games/sessions`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ date, game_type_id }),
  });
  return res.json();
}

export async function fetchGameResult(sessionId: number) {
  const res = await fetchWithAuth(
    `${API_BASE_URL}/v1/games/${sessionId}/results`
  );
  return res.json();
}

export async function submitGameResults(
  sessionId: number,
  payload: { user_id: number; rank: number; points_earned: number }[]
) {
  const res = await fetchWithAuth(
    `${API_BASE_URL}/v1/games/${sessionId}/results`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );
  return res.json();
}

export async function login(email: string, password: string) {
  const res = await fetchWithAuth(`${API_BASE_URL}/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error("Login failed");
  }

  return res.json(); // { token, user }
}

export async function getCurrentUser() {
  const res = await fetchWithAuth(`${API_BASE_URL}/v1/me`);
  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
}

export async function register(name: string, email: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/v1/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });

  if (!res.ok) {
    throw new Error("Register failed");
  }

  return res.json();
}

export async function playLottery() {
  const res = await fetchWithAuth(`${API_BASE_URL}/v1/lottery/play`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error("lottery play failed");
  }
  return res.json();
}

export async function getLastPlayedLotteryInfo() {
  const res = await fetchWithAuth(`${API_BASE_URL}/v1/lottery/last-played`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error("마지막 추첨 정보 조회 실패");
  }
  return res.json();
}
