import { useState, useEffect, useRef } from "react";
import {
  fetchActiveWizardGame,
  createWizardGame,
  joinWizardRoom,
  fetchWizardRooms,
  deleteWizardGame,
} from "../api/gameApi";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import LoadingSpinner from "../components/LoadingSpinner";
import SkullKingModal from "../components/skullking/SkullKingModal";
import { WizardGame } from "../types/wizard";
import {
  calculateWizardPlayerTotals,
  getWizardCompletedRounds,
  getWizardCurrentRound,
} from "../utils/wizardUtils";
import { getRankColor } from "../utils/skullKingUtils";
import RankBadge from "../components/skullking/RankBadge";
import LotteryBall from "../components/skullking/LotteryBall";

export default function WizardBoard() {
  const navigate = useNavigate();
  const [game, setGame] = useState<WizardGame | null>(null);
  const { user: currentUser } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const fetchingRef = useRef(false);

  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [waitingRooms, setWaitingRooms] = useState<WizardGame[]>([]);
  const [isJoining, setIsJoining] = useState(false);
  const [isRequestSent, setIsRequestSent] = useState(false);
  const [modalConfig, setModalConfig] = useState<{ message: string; title?: string } | null>(null);
  const showAlert = (message: string, title?: string) => setModalConfig({ message, title });

  const [showRankPopup, setShowRankPopup] = useState<{ round: number; rank: number; isUp: boolean | null } | null>(null);
  const prevGameRef = useRef<WizardGame | null>(null);

  const fetchData = async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      const [gameData, roomsData] = await Promise.all([
        fetchActiveWizardGame(),
        fetchWizardRooms(),
      ]);

      if (gameData) {
        setGame(gameData);
        setHasError(false);
        setIsRequestSent(false);
      } else {
        setGame(null);
      }

      setWaitingRooms(roomsData || []);
    } catch (err: any) {
      console.error("Failed to fetch game:", err);
      if (err.message?.includes("404")) {
        setGame(null);
      } else {
        setHasError(true);
      }
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!game || !currentUser) return;

    if (prevGameRef.current) {
      const playerIds = Array.from(new Set(game.scores.map((s) => s.user_id)));
      const totalRounds = game.total_rounds || 0;
      const roundList = Array.from({ length: totalRounds }, (_, i) => i + 1);

      const isRoundFullyCompleted = (g: WizardGame, r: number) => {
        const activeIds = new Set(
          g.scores.filter((s) => s.actual !== -2).map((s) => Number(s.user_id))
        );
        const scores = g.scores.filter(
          (s) => s.round === r && activeIds.has(Number(s.user_id))
        );
        return scores.length > 0 && scores.every((s) => s.actual !== -1);
      };

      const prevCompleted = new Set(
        roundList.filter((r) => isRoundFullyCompleted(prevGameRef.current!, r))
      );
      const currCompleted = new Set(
        roundList.filter((r) => isRoundFullyCompleted(game, r))
      );

      for (let r of currCompleted) {
        if (!prevCompleted.has(r)) {
          const allPlayersTotalAtRound = (g: WizardGame, roundLimit: number) => {
            return playerIds.map((id) => {
              const total = g.scores
                .filter((s) => s.user_id === id && s.round <= roundLimit)
                .reduce((sum, s) => sum + s.points, 0);
              return { id, total };
            });
          };

          const currentTotals = allPlayersTotalAtRound(game, r);
          const sortedCurrent = [...currentTotals].map((p) => p.total).sort((a, b) => b - a);
          const myTotal = currentTotals.find((p) => p.id === currentUser.id)?.total || 0;
          const currentRankIndex = sortedCurrent.indexOf(myTotal);

          const prevTotals = allPlayersTotalAtRound(prevGameRef.current!, r - 1);
          const sortedPrev = [...prevTotals].map((p) => p.total).sort((a, b) => b - a);
          const myPrevTotal = prevTotals.find((p) => p.id === currentUser.id)?.total || 0;
          const prevRankIndex = sortedPrev.indexOf(myPrevTotal);

          let isUp = null;
          if (currentRankIndex < prevRankIndex) isUp = true;
          else if (currentRankIndex > prevRankIndex) isUp = false;

          setShowRankPopup({ round: r, rank: currentRankIndex + 1, isUp });
          setTimeout(() => setShowRankPopup(null), 7000);
          break;
        }
      }
    }
    prevGameRef.current = game;
  }, [game, currentUser]);

  useEffect(() => {
    let timer: any;
    if (!hasError && !isLoading) {
      timer = setInterval(() => fetchData(), 3000);
    }
    return () => clearInterval(timer);
  }, [hasError, isLoading]);

  if (isLoading && !game) return <LoadingSpinner />;

  const handleCreateRoom = async () => {
    try {
      const newGame = await createWizardGame();
      setGame(newGame);
      navigate("/wizard/admin");
    } catch (err) {
      showAlert("방 생성에 실패했습니다.");
    }
  };

  const handleJoinRoom = async (code: string) => {
    setIsJoining(true);
    try {
      const result = await joinWizardRoom(code);
      if (result && result.status === 202) {
        setIsRequestSent(true);
      } else {
        fetchData();
      }
    } catch (err: any) {
      showAlert(err.message);
    } finally {
      setIsJoining(false);
    }
  };

  if (isRequestSent && !game) {
    return (
      <div className="container py-5 text-center" style={{ maxWidth: "500px" }}>
        <div className="glass-card p-5">
          <div className="display-1 mb-4">⏳</div>
          <h2 className="fw-bold mb-3">입장 요청 전송됨</h2>
          <p className="text-muted mb-5">
            이미 게임이 시작되었습니다.<br />
            방장이 입장을 승인할 때까지 잠시만 기다려주세요.
          </p>
          <button className="btn btn-outline-secondary w-100 py-3 rounded-4" onClick={() => setIsRequestSent(false)}>
            취소하고 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="container py-5 text-center" style={{ maxWidth: "600px" }}>
        <div className="glass-card p-5">
          <h2 className="fw-bold mb-4">🧙 WIZARD</h2>
          <p className="text-muted mb-5">현재 진행 중인 게임이 없습니다.</p>

          <button onClick={handleCreateRoom} className="btn btn-primary w-100 py-3 fw-bold rounded-4 shadow mb-5">
            새 방 만들기 (방장)
          </button>

          <div className="text-start mb-4">
            <label className="fw-bold text-muted small mb-3 px-2">참여 가능한 방 ({waitingRooms.length})</label>
            <div className="d-grid gap-2">
              {waitingRooms.map((room) => (
                <div key={room.id} className="bg-light p-3 rounded-4 d-flex justify-content-between align-items-center shadow-sm border">
                  <div className="text-start">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="fw-bold">👑 {room.host?.name || "Unknown"}의 방</span>
                      {room.status === "playing" ? (
                        <span className="badge bg-success-light text-success border border-success-subtle" style={{ fontSize: "0.6rem" }}>진행 중</span>
                      ) : (
                        <span className="badge bg-warning-light text-warning border border-warning-subtle" style={{ fontSize: "0.6rem" }}>대기 중</span>
                      )}
                    </div>
                    <div className="small text-muted">입장 코드: <span className="text-accent fw-bold">{room.room_code}</span></div>
                  </div>
                  <button
                    onClick={() => handleJoinRoom(room.room_code)}
                    className={`btn btn-sm px-3 py-2 rounded-pill fw-bold ${room.status === "playing" ? "btn-outline-primary" : "btn-accent"}`}
                    disabled={isJoining}
                  >
                    {room.status === "playing" ? "참여 요청" : "입장하기"}
                  </button>
                </div>
              ))}
              {waitingRooms.length === 0 && (
                <div className="text-center py-4 bg-light rounded-4 border border-dashed">
                  <span className="text-muted small">현재 대기 중인 방이 없습니다.</span>
                </div>
              )}
            </div>
          </div>

          <div className="hr-text mb-4">또는 코드 직접 입력</div>

          <form onSubmit={(e) => { e.preventDefault(); handleJoinRoom(roomCodeInput); }}>
            <div className="mb-3">
              <input
                type="text"
                className="form-control form-control-lg text-center fw-bold"
                placeholder="코드 입력"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                maxLength={6}
                style={{ letterSpacing: "5px", fontSize: "1.2rem" }}
              />
            </div>
            <button
              type="submit"
              className="btn btn-outline-secondary w-100 py-2 fw-bold rounded-4"
              disabled={isJoining || !roomCodeInput}
            >
              입장하기
            </button>
          </form>
        </div>

        <SkullKingModal
          show={!!modalConfig}
          message={modalConfig?.message || ""}
          title={modalConfig?.title}
          onConfirm={() => setModalConfig(null)}
        />
        <style>{`
          .hr-text {
            display: flex;
            align-items: center;
            text-align: center;
            color: #adb5bd;
          }
          .hr-text::before, .hr-text::after {
            content: '';
            flex: 1;
            border-bottom: 1px solid #dee2e6;
          }
          .hr-text::before { margin-right: .5em; }
          .hr-text::after { margin-left: .5em; }
        `}</style>
      </div>
    );
  }

  if (game.status === "waiting") {
    const participants = Array.from(new Set(game.scores.map((s) => s.user_id))).map((id) => {
      return game.scores.find((s) => s.user_id === id)?.user;
    });

    return (
      <div className="container py-5 text-center" style={{ maxWidth: "500px" }}>
        <div className="glass-card p-5">
          <div className="badge bg-warning text-dark mb-3 px-3 py-2">대기 중...</div>
          <h2 className="fw-bold mb-2">대기실</h2>
          <div className="display-4 fw-900 mb-4 text-accent" style={{ letterSpacing: "3px" }}>{game.room_code}</div>
          <p className="text-muted mb-4">플레이어들이 입장할 때까지 기다려주세요.</p>

          <div className="bg-light rounded-4 p-3 mb-4 text-start">
            <label className="small fw-bold text-muted mb-2 px-2">참여 중인 플레이어 ({participants.length})</label>
            <div className="d-flex flex-wrap gap-2">
              {participants.map((p) => (
                <div key={p?.id} className="badge bg-white text-dark border p-2 rounded-3 shadow-sm">
                  👤 {p?.name} {p?.id === game.host_id && <span className="text-accent ms-1">👑</span>}
                </div>
              ))}
            </div>
          </div>

          {game.host_id === currentUser?.id ? (
            <div className="d-flex flex-column gap-2">
              <Link to="/wizard/admin" className="btn btn-primary w-100 py-3 fw-bold rounded-4 shadow">
                게임 관리 화면으로 이동
              </Link>
              <button
                className="btn btn-outline-danger w-100 py-2 rounded-4"
                onClick={async () => {
                  if (!window.confirm("방을 삭제하시겠습니까?")) return;
                  try {
                    await deleteWizardGame(game.id);
                    setGame(null);
                    fetchData();
                  } catch {
                    showAlert("방 삭제에 실패했습니다.");
                  }
                }}
              >
                방 삭제
              </button>
            </div>
          ) : (
            <div className="alert alert-info border-0 rounded-4">
              방장이 게임을 시작하기를 기다리고 있습니다.
            </div>
          )}
        </div>
      </div>
    );
  }

  const totalRounds = game.total_rounds || 0;
  const completedRounds = getWizardCompletedRounds(game.scores);
  const allPlayersWithScores = calculateWizardPlayerTotals(game.scores, completedRounds);
  const sortedTotals = [...allPlayersWithScores].map((p) => p.total).sort((a, b) => b - a);
  const currentRound = getWizardCurrentRound(game.scores, totalRounds);

  const myScore = currentUser ? game.scores.find((s) => s.round === currentRound && s.user_id === currentUser.id) : null;
  const otherScores = game.scores.filter((s) => s.round === currentRound && (!currentUser || s.user_id !== currentUser.id));

  otherScores.sort((a, b) => {
    const aTotal = allPlayersWithScores.find((p) => p.id === a.user_id)?.total || 0;
    const bTotal = allPlayersWithScores.find((p) => p.id === b.user_id)?.total || 0;
    return bTotal - aTotal;
  });

  const renderHistoryItem = (r: number) => {
    const score = game.scores.find((s) => s.round === r && s.user_id === currentUser?.id);
    const isCompleted = score && completedRounds.has(r);
    const points = score ? score.points : 0;
    return (
      <div key={r} className="history-item mb-2 p-2 rounded-3 bg-light border d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <span className="fw-bold text-muted small" style={{ width: "40px" }}>R{r}</span>
        </div>
        <div className="d-flex align-items-center gap-3">
          <span className="fw-900" style={{ color: isCompleted ? (points > 0 ? "#ef4444" : points < 0 ? "#3b82f6" : "var(--text-main)") : "#adb5bd", fontSize: "0.95rem" }}>
            {isCompleted ? (points > 0 ? `+${points}` : points) : "-"}
          </span>
        </div>
      </div>
    );
  };

  // total_rounds 기준 좌/우 분할
  const halfPoint = Math.ceil(totalRounds / 2);
  const leftRounds = Array.from({ length: halfPoint }, (_, i) => i + 1);
  const rightRounds = Array.from({ length: totalRounds - halfPoint }, (_, i) => i + halfPoint + 1);

  return (
    <div className="container-fluid py-4 fade-in" style={{ maxWidth: "800px" }}>
      <div className="glass-card p-4 shadow-lg mb-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="fw-bold m-0" style={{ letterSpacing: "-1px" }}>
            🧙 WIZARD <span className="text-accent">LIVE</span>
          </h1>
          <div className="badge bg-primary px-3 py-2 fs-6">{currentRound}R {completedRounds.has(currentRound) && "🔒"}</div>
        </div>

        {game.host_id === currentUser?.id && (
          <div className="mb-4">
            <Link to="/wizard/admin" className="btn btn-outline-accent w-100 py-2 fw-bold">
              🛠️ 게임 관리 (방장 메뉴)
            </Link>
          </div>
        )}

        <div className="text-center pt-3 pb-3">
          {myScore && currentUser ? (
            <div className="d-flex justify-content-between align-items-center w-100">
              <div className="d-flex flex-column gap-2" style={{ width: "27%" }}>
                {leftRounds.map(renderHistoryItem)}
              </div>

              <div className="d-flex flex-column align-items-center text-center" style={{ width: "42%", marginTop: "-15px" }}>
                <div className="mb-3 fw-bold" style={{ color: "var(--text-main)", fontSize: "1.2rem" }}>나의 예측</div>
                <LotteryBall
                  value={myScore.bid}
                  size="large"
                  color={getRankColor(allPlayersWithScores.find((p) => p.id === currentUser.id)?.total || 0, sortedTotals)}
                  className="mb-4"
                />
                <div className="d-flex align-items-center justify-content-center gap-2 mt-1">
                  <RankBadge total={allPlayersWithScores.find((p) => p.id === currentUser.id)?.total || 0} sortedTotals={sortedTotals} />
                  <div className="fw-bold" style={{ color: getRankColor(allPlayersWithScores.find((p) => p.id === currentUser.id)?.total || 0, sortedTotals), fontSize: "1.05rem" }}>
                    {allPlayersWithScores.find((p) => p.id === currentUser.id)?.total || 0} pts
                  </div>
                </div>
              </div>

              <div className="d-flex flex-column gap-2" style={{ width: "27%" }}>
                {rightRounds.map(renderHistoryItem)}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="glass-card p-4 shadow-sm mb-4">
        <div className="text-center">
          <h5 className="mb-4 text-muted fw-bold">다른 플레이어</h5>
          <div className="row g-3 justify-content-center px-1">
            {otherScores.map((score) => {
              const player = allPlayersWithScores.find((p) => p.id === score.user_id);
              const rankColor = getRankColor(player?.total || 0, sortedTotals);

              return (
                <div key={score.user_id} className="col-4 d-flex flex-column align-items-center text-center">
                  <div className="mb-2"><RankBadge total={player?.total || 0} sortedTotals={sortedTotals} /></div>
                  <LotteryBall value={score.bid} color={rankColor} className="mb-2" />
                  <div className="fw-bold text-truncate w-100" style={{ color: "var(--text-main)", fontSize: "0.95rem" }}>{player?.name}</div>
                  <div className="small fw-bold" style={{ color: rankColor }}>{player?.total} pts</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showRankPopup && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-start" style={{ zIndex: 1050, backdropFilter: "blur(5px)", backgroundColor: "rgba(0,0,0,0.4)", paddingTop: "15vh" }}>
          <div className="bg-white p-4 rounded-4 shadow-lg text-center mx-3 pop-in" style={{ minWidth: "300px", maxWidth: "400px" }}>
            <div style={{ fontSize: "3rem", marginBottom: "10px" }}>
              {showRankPopup.rank === 1 ? "👑" : showRankPopup.isUp ? "🚀" : showRankPopup.isUp === false ? "😢" : "👏"}
            </div>
            <h5 className="fw-bold mb-2 text-accent">{showRankPopup.round}R 종료!</h5>
            <h3 className="fw-900 mb-4">현재 <span style={{ color: getRankColor(sortedTotals[showRankPopup.rank - 1] || 0, sortedTotals) }}>{showRankPopup.rank}위</span> 입니다</h3>

            {showRankPopup.isUp === true && <div className="text-success fw-bold mb-4 fs-5">순위가 올랐습니다! 📈</div>}
            {showRankPopup.isUp === false && <div className="text-danger fw-bold mb-4 fs-5">순위가 떨어졌습니다 📉</div>}
            {showRankPopup.isUp === null && <div className="text-muted fw-bold mb-4 fs-5">순위 유지 중! ➖</div>}

            <button className="btn btn-primary px-5 py-2 rounded-pill fw-bold w-100 fs-5" onClick={() => setShowRankPopup(null)}>확인</button>
          </div>
        </div>
      )}

      <SkullKingModal
        show={!!modalConfig}
        message={modalConfig?.message || ""}
        title={modalConfig?.title}
        onConfirm={() => setModalConfig(null)}
      />
    </div>
  );
}
