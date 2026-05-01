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
  payload: { name?: string; email?: string; old_password?: string; new_password?: string }
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

export async function fetchUserStats() {
  const res = await fetchWithAuth(`${API_BASE_URL}/v1/me/stats`);
  if (!res.ok) throw new Error("통계 불러오기 실패");
  return res.json();
}

export async function register(name: string, email: string, password: string, inviteCode: string) {
  const res = await fetch(`${API_BASE_URL}/v1/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password, invite_code: inviteCode }),
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

export async function createSkullKingGame() {
  const res = await fetchWithAuth(`${API_BASE_URL}/v1/skullking/game`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("스컬킹 방 생성 실패");
  return res.json();
}

export async function joinSkullKingRoom(roomCode: string) {
  const res = await fetchWithAuth(`${API_BASE_URL}/v1/skullking/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ room_code: roomCode }),
  });
  if (res.status === 202) {
    const data = await res.json();
    return { status: 202, message: data.message };
  }
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "방 입장 실패");
  }
  return res.json();
}

export async function approveSkullKingJoin(gameId: number, userId: number) {
  const res = await fetchWithAuth(`${API_BASE_URL}/v1/skullking/join/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ game_id: gameId, user_id: userId }),
  });
  if (!res.ok) throw new Error("승인 실패");
  return res.json();
}

export async function rejectSkullKingJoin(gameId: number, userId: number) {
  const res = await fetchWithAuth(`${API_BASE_URL}/v1/skullking/join/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ game_id: gameId, user_id: userId }),
  });
  if (!res.ok) throw new Error("거절 실패");
  return res.json();
}

export async function startSkullKingGame(gameId: number) {
  const res = await fetchWithAuth(`${API_BASE_URL}/v1/skullking/start/${gameId}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("게임 시작 실패");
  return res.json();
}

export async function fetchActiveSkullKingGame() {
  const res = await fetchWithAuth(`${API_BASE_URL}/v1/skullking/active`);
  if (!res.ok) {
    if (res.status === 404) return null;
    if (res.status === 403) throw new Error("403: 참여 권한이 없습니다.");
    throw new Error("스컬킹 게임 불러오기 실패");
  }
  return res.json();
}

export async function fetchSkullKingRooms() {
  const res = await fetchWithAuth(`${API_BASE_URL}/v1/skullking/rooms`);
  if (!res.ok) throw new Error("방 목록 불러오기 실패");
  return res.json();
}

export async function fetchSkullKingHistory() {
  const res = await fetchWithAuth(`${API_BASE_URL}/v1/skullking/history`);
  if (!res.ok) throw new Error("스컬킹 기록 불러오기 실패");
  return res.json();
}

export async function updateSkullKingScore(payload: {
  game_id: number;
  user_id: number;
  round: number;
  bid: number;
  actual: number;
  bonus: number;
}) {
  const res = await fetchWithAuth(`${API_BASE_URL}/v1/skullking/score`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("점수 업데이트 실패");
  return res.json();
}



export async function deleteSkullKingGame(gameId: number) {
  const res = await fetchWithAuth(`${API_BASE_URL}/v1/skullking/${gameId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("게임 삭제 실패");
  return res.json();
}

export async function endSkullKingGame(gameId: number) {
  const res = await fetchWithAuth(`${API_BASE_URL}/v1/skullking/end/${gameId}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("게임 종료 실패");
  return res.json();
}

export async function fetchInvites() {
  const res = await fetchWithAuth(`${API_BASE_URL}/v1/admin/invites`);
  if (!res.ok) throw new Error("초대 코드 목록 불러오기 실패");
  return res.json();
}

export async function generateInvite() {
  const res = await fetchWithAuth(`${API_BASE_URL}/v1/admin/invites`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("초대 코드 생성 실패");
  return res.json();
}

// 사다리 타기 API
export async function createLadderGame(results: string[]) {
  const res = await fetchWithAuth(`${API_BASE_URL}/v1/ladder/game`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ results }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "게임 생성 실패");
  }
  return res.json();
}

export async function fetchLadderRooms() {
  const res = await fetchWithAuth(`${API_BASE_URL}/v1/ladder/rooms`);
  if (!res.ok) throw new Error("방 목록 불러오기 실패");
  return res.json();
}

export async function joinLadderRoom(roomCode: string) {
  const res = await fetchWithAuth(`${API_BASE_URL}/v1/ladder/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ room_code: roomCode }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "방 참여 실패");
  }
  return res.json();
}

export async function startLadderGame(gameId: number) {
  const res = await fetchWithAuth(`${API_BASE_URL}/v1/ladder/start/${gameId}`, {
    method: "POST",
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "게임 시작 실패");
  }
  return res.json();
}

export async function fetchActiveLadderGame() {
  const res = await fetchWithAuth(`${API_BASE_URL}/v1/ladder/active`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("게임 정보 불러오기 실패");
  return res.json();
}

export async function deleteLadderGame(gameId: number) {
  const res = await fetchWithAuth(`${API_BASE_URL}/v1/ladder/${gameId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "게임 삭제 실패");
  }
}

// 위자드 API
export async function createWizardGame() {
  const res = await fetchWithAuth(`${API_BASE_URL}/v1/wizard/game`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("위자드 방 생성 실패");
  return res.json();
}

export async function joinWizardRoom(roomCode: string) {
  const res = await fetchWithAuth(`${API_BASE_URL}/v1/wizard/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ room_code: roomCode }),
  });
  if (res.status === 202) {
    const data = await res.json();
    return { status: 202, message: data.message };
  }
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "방 입장 실패");
  }
  return res.json();
}

export async function approveWizardJoin(gameId: number, userId: number) {
  const res = await fetchWithAuth(`${API_BASE_URL}/v1/wizard/join/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ game_id: gameId, user_id: userId }),
  });
  if (!res.ok) throw new Error("승인 실패");
  return res.json();
}

export async function rejectWizardJoin(gameId: number, userId: number) {
  const res = await fetchWithAuth(`${API_BASE_URL}/v1/wizard/join/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ game_id: gameId, user_id: userId }),
  });
  if (!res.ok) throw new Error("거절 실패");
  return res.json();
}

export async function startWizardGame(gameId: number) {
  const res = await fetchWithAuth(`${API_BASE_URL}/v1/wizard/start/${gameId}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("게임 시작 실패");
  return res.json();
}

export async function fetchActiveWizardGame() {
  const res = await fetchWithAuth(`${API_BASE_URL}/v1/wizard/active`);
  if (!res.ok) {
    if (res.status === 404) return null;
    if (res.status === 403) throw new Error("403: 참여 권한이 없습니다.");
    throw new Error("위자드 게임 불러오기 실패");
  }
  return res.json();
}

export async function fetchWizardRooms() {
  const res = await fetchWithAuth(`${API_BASE_URL}/v1/wizard/rooms`);
  if (!res.ok) throw new Error("방 목록 불러오기 실패");
  return res.json();
}

export async function fetchWizardHistory() {
  const res = await fetchWithAuth(`${API_BASE_URL}/v1/wizard/history`);
  if (!res.ok) throw new Error("위자드 기록 불러오기 실패");
  return res.json();
}

export async function updateWizardScore(payload: {
  game_id: number;
  user_id: number;
  round: number;
  bid: number;
  actual: number;
}) {
  const res = await fetchWithAuth(`${API_BASE_URL}/v1/wizard/score`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("점수 업데이트 실패");
  return res.json();
}

export async function endWizardGame(gameId: number) {
  const res = await fetchWithAuth(`${API_BASE_URL}/v1/wizard/end/${gameId}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("게임 종료 실패");
  return res.json();
}

export async function deleteWizardGame(gameId: number) {
  const res = await fetchWithAuth(`${API_BASE_URL}/v1/wizard/${gameId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("게임 삭제 실패");
  return res.json();
}
