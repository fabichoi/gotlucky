import { useState, useEffect, useRef } from "react";
import { fetchActiveSkullKingGame } from "../api/gameApi";
import { useUser } from "../context/UserContext";
import LoadingSpinner from "../components/LoadingSpinner";

interface PlayerScore {
  round: number;
  user_id: number;
  user: { name: string };
  bid: number;
  actual: number;
  points: number;
  bonus: number;
}

interface Game {
  id: number;
  is_active: boolean;
  scores: PlayerScore[];
}

export default function SkullKingBoard() {
  const [game, setGame] = useState<Game | null>(null);
  const { user: currentUser } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const fetchingRef = useRef(false);

  const [showRankPopup, setShowRankPopup] = useState<{ round: number; rank: number; isUp: boolean | null } | null>(null);
  const prevGameRef = useRef<Game | null>(null);

  const fetchData = async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      const gameData = await fetchActiveSkullKingGame();

      if (!gameData) {
        setError("현재 진행 중인 게임이 없습니다.");
        setHasError(true);
        setGame(null);
        return;
      }

      setGame(gameData);
      setError(null);
      setHasError(false);
    } catch (err: any) {
      console.error("Failed to fetch game:", err);
      setError(err.message || "게임 정보를 가져오는 데 실패했습니다.");
      setHasError(true);
      setGame(null);
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // Only initial fetch on mount

  useEffect(() => {
    if (!game) return;

    if (prevGameRef.current && currentUser) {
      const prevCompleted = new Set(prevGameRef.current.scores.filter(s => s.actual !== -1).map(s => s.round));
      const currCompleted = new Set(game.scores.filter(s => s.actual !== -1).map(s => s.round));

      for (let r of currCompleted) {
        if (!prevCompleted.has(r)) {
          // A round was just completed
          const allPlayersWithScores = Array.from(new Set(game.scores.map(s => s.user_id))).map(id => {
            const total = game.scores.filter(s => s.user_id === id && s.actual !== -1).reduce((sum, s) => sum + s.points, 0);
            return { id, total };
          });
          const sortedScores = [...allPlayersWithScores].map(p => p.total).sort((a, b) => b - a);
          const myTotal = allPlayersWithScores.find(p => p.id === currentUser.id)?.total || 0;
          const currentRankIndex = sortedScores.indexOf(myTotal);

          const prevAllPlayersWithScores = Array.from(new Set(prevGameRef.current.scores.map(s => s.user_id))).map(id => {
            const total = prevGameRef.current!.scores.filter(s => s.user_id === id && s.actual !== -1).reduce((sum, s) => sum + s.points, 0);
            return { id, total };
          });
          const prevSortedScores = [...prevAllPlayersWithScores].map(p => p.total).sort((a, b) => b - a);
          const myPrevTotal = prevAllPlayersWithScores.find(p => p.id === currentUser.id)?.total || 0;
          const prevRankIndex = prevSortedScores.indexOf(myPrevTotal);

          let isUp = null;
          if (currentRankIndex < prevRankIndex) isUp = true;
          else if (currentRankIndex > prevRankIndex) isUp = false;

          setShowRankPopup({ round: r, rank: currentRankIndex + 1, isUp });
          setTimeout(() => setShowRankPopup(null), 7000); // auto hide
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

  if (!game) {
    return (
      <div className="container py-5 text-center">
        <div className="glass-card p-5">
          <h2 className="text-muted">현재 진행 중인 게임이 없습니다.</h2>
        </div>
      </div>
    );
  }

  // Get unique players with their total scores
  const allPlayersWithScores = Array.from(new Set(game.scores.map(s => s.user_id))).map(id => {
    const user = game.scores.find(s => s.user_id === id)?.user;
    const total = game.scores
      .filter(s => s.user_id === id && s.actual !== -1)
      .reduce((sum, s) => sum + s.points, 0);
    return { id, name: user?.name, total };
  });


  // Get sorted scores to determine rank
  const sortedScores = [...allPlayersWithScores].map(p => p.total).sort((a, b) => b - a);

  const getRankColor = (total: number) => {
    const rankIndex = sortedScores.indexOf(total);
    const rainbow = [
      "#ff4d4d", // Red
      "#ffa64d", // Orange
      "#ffdb4d", // Yellow
      "#4dff88", // Green
      "#4d94ff", // Blue
      "#804dff", // Indigo
      "#db4dff"  // Violet
    ];
    return rainbow[rankIndex] || "#6c757d";
  };

  const getRankBadge = (total: number) => {
    const rankIndex = sortedScores.indexOf(total);
    const ranks = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th"];
    const colors = ["#ff4d4d", "#ffa64d", "#ffdb4d", "#4dff88", "#4d94ff", "#804dff", "#db4dff"];

    return (
      <span className="rank-badge" style={{ backgroundColor: colors[rankIndex] || "#6c757d" }}>
        {ranks[rankIndex] || `${rankIndex + 1}th`}
      </span>
    );
  };

  let currentRound = 1;
  for (let r = 1; r <= 10; r++) {
    const roundScores = game.scores.filter(s => s.round === r);
    if (roundScores.some(s => s.actual === -1)) {
      currentRound = r;
      break;
    }
    if (r === 10) currentRound = 10;
  }

  const myScore = currentUser ? game.scores.find(s => s.round === currentRound && s.user_id === currentUser.id) : null;
  const otherScores = game.scores.filter(s => s.round === currentRound && (!currentUser || s.user_id !== currentUser.id));


  // Sort otherScores by rank (total points)
  otherScores.sort((a, b) => {
    const aTotal = allPlayersWithScores.find(p => p.id === a.user_id)?.total || 0;
    const bTotal = allPlayersWithScores.find(p => p.id === b.user_id)?.total || 0;
    return bTotal - aTotal;
  });

  return (
    <div className="container-fluid py-4 fade-in" style={{ maxWidth: "800px" }}>
      <div className="glass-card p-4 shadow-lg mb-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="fw-bold m-0" style={{ letterSpacing: "-1px" }}>
            💀 SKULL KING <span className="text-accent">LIVE</span>
          </h1>
          <div className="badge bg-primary px-3 py-2 fs-6">Round {currentRound}</div>
        </div>

        {/* Current Round Display */}
        <div className="text-center pt-3 pb-3">
          {myScore ? (() => {
            const myPlayer = allPlayersWithScores.find(p => p.id === currentUser?.id);
            const myRankColor = myPlayer ? getRankColor(myPlayer.total) : 'var(--accent-color)';

            const renderHistoryItem = (r: number) => {
              const score = game.scores.find(s => s.round === r && s.user_id === currentUser?.id);
              const isCompleted = score && score.actual !== -1;
              const points = score ? score.points + (score.bonus || 0) : 0;
              const isSuccess = score && score.bid === score.actual;

              return (
                <div
                  key={r}
                  className="d-flex align-items-center justify-content-between py-2"
                  style={{
                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                    opacity: isCompleted || currentRound === r ? 1 : 0.4,
                  }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <div style={{
                      width: "6px", height: "6px", borderRadius: "50%",
                      backgroundColor: isCompleted ? (isSuccess ? '#ef4444' : '#3b82f6') : '#e5e7eb'
                    }} />
                    <span className="fw-bold text-muted" style={{ fontSize: "0.8rem", letterSpacing: "-0.5px" }}>{r} 라운드</span>
                  </div>
                  <span className="fw-900" style={{ color: isCompleted ? (points > 0 ? '#ef4444' : points < 0 ? '#3b82f6' : 'var(--text-main)') : '#adb5bd', fontSize: "0.95rem" }}>
                    {isCompleted ? (points > 0 ? `+${points}` : points) : '-'}
                  </span>
                </div>
              );
            };

            return (
              <div className="d-flex justify-content-between align-items-center w-100">
                <div className="d-flex flex-column gap-2" style={{ width: "27%" }}>
                  {[1, 2, 3, 4, 5].map(renderHistoryItem)}
                </div>

                <div className="d-flex flex-column align-items-center text-center" style={{ width: "42%", marginTop: "-15px" }}>
                  <div className="mb-3 fw-bold" style={{ color: 'var(--text-main)', fontSize: '1.2rem' }}>나의 예측</div>
                  <div
                    className="lottery-ball shadow-lg mb-4 mx-auto d-flex align-items-center justify-content-center"
                    style={{
                      borderColor: myRankColor,
                      width: "100px", height: "100px",
                      fontSize: "3rem", borderWidth: "5px", borderStyle: "solid",
                      borderRadius: "50%", background: "linear-gradient(135deg, #ffffff, #f4f4f4)",
                      fontWeight: 900, color: "var(--text-main)"
                    }}
                  >
                    {myScore.bid}
                  </div>
                  <div className="d-flex align-items-center justify-content-center gap-2 mt-1">
                    {getRankBadge(myPlayer?.total || 0)}
                    <div className="fw-bold" style={{ color: myRankColor, fontSize: '1.05rem' }}>{myPlayer?.total || 0} pts</div>
                  </div>
                </div>

                <div className="d-flex flex-column gap-2" style={{ width: "27%" }}>
                  {[6, 7, 8, 9, 10].map(renderHistoryItem)}
                </div>
              </div>
            );
          })() : null}
        </div>
      </div>

      <div className="glass-card p-4 shadow-sm mb-4">
        <div className="text-center">
          <h5 className="mb-4 text-muted fw-bold">다른 플레이어</h5>
          <div className="row g-3 justify-content-center px-1">
            {otherScores.map(score => {
              const player = allPlayersWithScores.find(p => p.id === score.user_id);
              const rankColor = getRankColor(player?.total || 0);

              return (
                <div key={score.user_id} className="col-4 d-flex flex-column align-items-center text-center">
                  <div className="mb-2">{getRankBadge(player?.total || 0)}</div>
                  <div className="lottery-ball other-bid shadow-sm mb-2 mx-auto" style={{ border: `3px solid ${rankColor}` }}>
                    {score.bid}
                  </div>
                  <div className="fw-bold text-truncate w-100" style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{player?.name}</div>
                  <div className="small fw-bold" style={{ color: rankColor }}>{player?.total} pts</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>



      {showRankPopup && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-start" style={{ zIndex: 1050, backdropFilter: "blur(5px)", backgroundColor: "rgba(0,0,0,0.4)", paddingTop: "15vh" }}>
          <div className="bg-white p-4 rounded-4 shadow-lg text-center mx-3" style={{ minWidth: "300px", maxWidth: "400px", animation: "popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)" }}>
            <div style={{ fontSize: "3rem", marginBottom: "10px" }}>
              {showRankPopup.rank === 1 ? "👑" : showRankPopup.isUp ? "🚀" : showRankPopup.isUp === false ? "😢" : "👏"}
            </div>
            <h5 className="fw-bold mb-2 text-accent">Round {showRankPopup.round} 종료!</h5>
            <h3 className="fw-900 mb-4">현재 <span style={{ color: getRankColor(sortedScores[showRankPopup.rank - 1] || 0) }}>{showRankPopup.rank}위</span> 입니다</h3>

            {showRankPopup.isUp === true && <div className="text-success fw-bold mb-4 fs-5">순위가 올랐습니다! 📈</div>}
            {showRankPopup.isUp === false && <div className="text-danger fw-bold mb-4 fs-5">순위가 떨어졌습니다 📉</div>}
            {showRankPopup.isUp === null && <div className="text-muted fw-bold mb-4 fs-5">순위 유지 중! ➖</div>}

            <button className="btn btn-primary px-5 py-2 rounded-pill fw-bold w-100 fs-5" onClick={() => setShowRankPopup(null)}>확인</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes popIn {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .lottery-ball {
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          background: linear-gradient(135deg, #ffffff, #f4f4f4);
          color: var(--text-main);
        }
        .lottery-ball.my-bid {
          width: 140px;
          height: 140px;
          font-size: 4rem;
          border-width: 6px;
          border-style: solid;
          border-color: var(--accent-color); /* fallback */
          box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important;
        }
        .lottery-ball.other-bid {
          width: 80px;
          height: 80px;
          font-size: 2.5rem;
          background: #ffffff;
        }
        .rank-badge {
          font-size: 0.8rem;
          font-weight: 800;
          color: white;
          padding: 4px 10px;
          border-radius: 6px;
          text-transform: uppercase;
        }
        .text-accent {
          color: var(--accent-color);
        }
        .fw-900 {
          font-weight: 900;
        }
      `}</style>
    </div>
  );
}
