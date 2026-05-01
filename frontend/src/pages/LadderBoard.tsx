import { useState, useEffect, useRef } from "react";
import { useUser } from "../context/UserContext";
import LoadingSpinner from "../components/LoadingSpinner";
import LadderCanvas from "../components/ladder/LadderCanvas";
import {
  fetchActiveLadderGame,
  fetchLadderRooms,
  createLadderGame,
  joinLadderRoom,
  startLadderGame,
  deleteLadderGame,
} from "../api/gameApi";
import { LadderGame } from "../types/ladder";

export default function LadderBoard() {
  const { user } = useUser();
  const [game, setGame] = useState<LadderGame | null>(null);
  const [rooms, setRooms] = useState<LadderGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false);

  // 방 만들기 state
  const [showCreate, setShowCreate] = useState(false);
  const [resultInput, setResultInput] = useState("");
  const [creating, setCreating] = useState(false);

  // 방 참여 state
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [joining, setJoining] = useState(false);

  const fetchData = async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const [gameData, roomsData] = await Promise.all([
        fetchActiveLadderGame(),
        fetchLadderRooms(),
      ]);
      setGame(gameData);
      setRooms(roomsData ?? []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, 2000);
    return () => clearInterval(timer);
  }, []);

  const handleCreate = async () => {
    const labels = resultInput
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (labels.length < 2) {
      setError("결과 항목을 2개 이상 입력해주세요.");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      await createLadderGame(labels);
      setShowCreate(false);
      setResultInput("");
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (code: string) => {
    setJoining(true);
    setError(null);
    try {
      await joinLadderRoom(code);
      setRoomCodeInput("");
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setJoining(false);
    }
  };

  const handleStart = async () => {
    if (!game) return;
    setError(null);
    try {
      await startLadderGame(game.id);
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!game || !window.confirm("방을 삭제하시겠습니까?")) return;
    setError(null);
    try {
      await deleteLadderGame(game.id);
      setGame(null);
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  const isHost = game?.host_id === user?.id;
  const maxPlayers = game?.results.length ?? 0;
  const currentPlayers = game?.participants.length ?? 0;
  const canStart = isHost && currentPlayers === maxPlayers;

  return (
    <div className="container py-4" style={{ maxWidth: "800px" }}>
      <h1 className="fw-bold mb-4">🪜 사다리 타기</h1>

      {error && (
        <div className="alert alert-danger py-2 mb-3">{error}</div>
      )}

      {/* ── 게임 중 ── */}
      {game && game.status === "running" && (
        <div className="glass-card p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="fw-bold mb-0">방 코드: {game.room_code}</h5>
          </div>
          <LadderCanvas game={game} />
        </div>
      )}

      {/* ── 대기 중 ── */}
      {game && game.status === "waiting" && (
        <div className="glass-card p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="fw-bold mb-0">방 코드: <code>{game.room_code}</code></h5>
              <small className="text-muted">참여자 {currentPlayers} / {maxPlayers}명</small>
            </div>
            {isHost && (
              <div className="d-flex gap-2">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleStart}
                  disabled={!canStart}
                >
                  시작
                </button>
                <button className="btn btn-outline-danger btn-sm" onClick={handleDelete}>
                  삭제
                </button>
              </div>
            )}
          </div>
          {!canStart && isHost && (
            <div className="alert alert-info py-2 small mb-3">
              참여자가 {maxPlayers}명이 되면 시작할 수 있습니다.
            </div>
          )}

          <div className="row g-3">
            <div className="col-md-6">
              <p className="fw-bold small text-muted mb-2">참여자</p>
              <ul className="list-group list-group-flush">
                {game.participants.map((p) => (
                  <li key={p.id} className="list-group-item px-0 py-1 small">
                    {p.user.name}
                    {p.user_id === game.host_id && (
                      <span className="badge bg-warning text-dark ms-2">방장</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-md-6">
              <p className="fw-bold small text-muted mb-2">결과 항목</p>
              <ul className="list-group list-group-flush">
                {game.results.map((r) => (
                  <li key={r.id} className="list-group-item px-0 py-1 small">
                    {r.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ── 로비 (게임 없음) ── */}
      {!game && (
        <>
          {/* 방 만들기 */}
          <div className="glass-card p-4 mb-3">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="fw-bold mb-0">방 만들기</h6>
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => setShowCreate((v) => !v)}
              >
                {showCreate ? "닫기" : "새 방"}
              </button>
            </div>
            {showCreate && (
              <div className="mt-3">
                <label className="form-label small fw-bold">
                  결과 항목 (줄바꿈 또는 쉼표로 구분, 2~8개)
                </label>
                <textarea
                  className="form-control mb-2"
                  rows={4}
                  placeholder={"커피 사기\n벌칙\n면제\n당첨"}
                  value={resultInput}
                  onChange={(e) => setResultInput(e.target.value)}
                />
                <button
                  className="btn btn-primary w-100"
                  onClick={handleCreate}
                  disabled={creating}
                >
                  {creating ? "생성 중..." : "방 만들기"}
                </button>
              </div>
            )}
          </div>

          {/* 방 참여 */}
          <div className="glass-card p-4 mb-4">
            <h6 className="fw-bold mb-3">코드로 참여</h6>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="방 코드 입력"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                maxLength={6}
              />
              <button
                className="btn btn-primary"
                onClick={() => handleJoin(roomCodeInput)}
                disabled={joining || roomCodeInput.length < 6}
              >
                {joining ? "참여 중..." : "참여"}
              </button>
            </div>
          </div>

          {/* 방 목록 */}
          <h6 className="fw-bold mb-2">열려 있는 방</h6>
          {rooms.length === 0 ? (
            <p className="text-muted small">현재 열린 방이 없습니다.</p>
          ) : (
            <ul className="list-group">
              {rooms.map((room) => (
                <li
                  key={room.id}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <div>
                    <span className="fw-bold me-2">
                      <code>{room.room_code}</code>
                    </span>
                    <small className="text-muted">
                      {room.host.name} · {room.participants.length}/{room.results.length}명
                    </small>
                  </div>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => handleJoin(room.room_code)}
                    disabled={joining}
                  >
                    참여
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
