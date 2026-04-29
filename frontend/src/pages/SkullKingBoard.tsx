import { useState, useEffect, useRef } from "react";
import { fetchActiveSkullKingGame } from "../api/gameApi";
import { useUser } from "../context/UserContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { SkullKingGame, PlayerScore } from "../types/skullKing";
import {
  calculatePlayerTotals,
  getCompletedRounds,
  getRankColor,
  getCurrentRound,
} from "../utils/skullKingUtils";
import RankBadge from "../components/skullking/RankBadge";
import LotteryBall from "../components/skullking/LotteryBall";

export default function SkullKingBoard() {
  const [game, setGame] = useState<SkullKingGame | null>(null);
  const { user: currentUser } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const fetchingRef = useRef(false);

  const [showRankPopup, setShowRankPopup] = useState<{ round: number; rank: number; isUp: boolean | null } | null>(null);
  const prevGameRef = useRef<SkullKingGame | null>(null);

  const fetchData = async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      const gameData = await fetchActiveSkullKingGame();

      if (!gameData) {
        setHasError(true);
        setGame(null);
        return;
      }

      setGame(gameData);
      setHasError(false);
    } catch (err: any) {
      console.error("Failed to fetch game:", err);
      setHasError(true);
      setGame(null);
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
      const playerIds = Array.from(new Set(game.scores.map(s => s.user_id)));
      
      const isRoundFullyCompleted = (g: SkullKingGame, r: number) => {
        const activeIds = new Set(g.scores.filter(s => s.actual !== -1).map(s => Number(s.user_id)));
        const scores = g.scores.filter(s => s.round === r && activeIds.has(Number(s.user_id)));
        return scores.length > 0 && scores.every(s => s.actual !== -1);
      };

      const prevCompleted = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(r => isRoundFullyCompleted(prevGameRef.current!, r)));
      const currCompleted = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(r => isRoundFullyCompleted(game, r)));

      for (let r of currCompleted) {
        if (!prevCompleted.has(r)) {
          const allPlayersTotalAtRound = (g: SkullKingGame, roundLimit: number) => {
            return playerIds.map(id => {
              const total = g.scores
                .filter(s => s.user_id === id && s.round <= roundLimit)
                .reduce((sum, s) => sum + s.points, 0);
              return { id, total };
            });
          };

          const currentTotals = allPlayersTotalAtRound(game, r);
          const sortedCurrent = [...currentTotals].map(p => p.total).sort((a, b) => b - a);
          const myTotal = currentTotals.find(p => p.id === currentUser.id)?.total || 0;
          const currentRankIndex = sortedCurrent.indexOf(myTotal);

          const prevTotals = allPlayersTotalAtRound(prevGameRef.current!, r - 1);
          const sortedPrev = [...prevTotals].map(p => p.total).sort((a, b) => b - a);
          const myPrevTotal = prevTotals.find(p => p.id === currentUser.id)?.total || 0;
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

  if (!game) {
    return (
      <div className="container py-5 text-center">
        <div className="glass-card p-5">
          <h2 className="text-muted">현재 진행 중인 게임이 없습니다.</h2>
        </div>
      </div>
    );
  }

  const completedRounds = getCompletedRounds(game.scores);
  const allPlayersWithScores = calculatePlayerTotals(game.scores, completedRounds);
  const sortedTotals = [...allPlayersWithScores].map(p => p.total).sort((a, b) => b - a);
  const currentRound = getCurrentRound(game.scores);

  const myScore = currentUser ? game.scores.find(s => s.round === currentRound && s.user_id === currentUser.id) : null;
  const otherScores = game.scores.filter(s => s.round === currentRound && (!currentUser || s.user_id !== currentUser.id));

  otherScores.sort((a, b) => {
    const aTotal = allPlayersWithScores.find(p => p.id === a.user_id)?.total || 0;
    const bTotal = allPlayersWithScores.find(p => p.id === b.user_id)?.total || 0;
    return bTotal - aTotal;
  });

  const renderHistoryItem = (r: number) => {
    const score = game.scores.find(s => s.round === r && s.user_id === currentUser?.id);
    const isCompleted = score && completedRounds.has(r);
    const points = score ? score.points : 0;
    const isSuccess = score && score.bid === score.actual;
    const isPerfect = isSuccess && score.bid === r; 

    return (
      <div key={r} className="history-item mb-2 p-2 rounded-3 bg-light border d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <span className="fw-bold text-muted small" style={{ width: "50px" }}>{r} 라운드</span>
          <div style={{ 
            width: "6px", height: "6px", borderRadius: "50%", 
            backgroundColor: isCompleted ? (isSuccess ? '#ef4444' : '#3b82f6') : '#e5e7eb'
          }} />
        </div>
        <div className="d-flex align-items-center gap-3">
          {isCompleted && isPerfect && <span className="badge bg-warning text-dark p-1" style={{ fontSize: "0.6rem" }}>PERFECT</span>}
          <span className="fw-900" style={{ color: isCompleted ? (points > 0 ? '#ef4444' : points < 0 ? '#3b82f6' : 'var(--text-main)') : '#adb5bd', fontSize: "0.95rem" }}>
            {isCompleted ? (points > 0 ? `+${points}` : points) : '-'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid py-4 fade-in" style={{ maxWidth: "800px" }}>
      <div className="glass-card p-4 shadow-lg mb-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="fw-bold m-0" style={{ letterSpacing: "-1px" }}>
            💀 SKULL KING <span className="text-accent">LIVE</span>
          </h1>
          <div className="badge bg-primary px-3 py-2 fs-6">{currentRound} 라운드 {completedRounds.has(currentRound) && "🔒"}</div>
        </div>

        <div className="text-center pt-3 pb-3">
          {myScore && currentUser ? (
            <div className="d-flex justify-content-between align-items-center w-100">
              <div className="d-flex flex-column gap-2" style={{ width: "27%" }}>
                {[1, 2, 3, 4, 5].map(renderHistoryItem)}
              </div>

              <div className="d-flex flex-column align-items-center text-center" style={{ width: "42%", marginTop: "-15px" }}>
                <div className="mb-3 fw-bold" style={{ color: 'var(--text-main)', fontSize: '1.2rem' }}>나의 예측</div>
                <LotteryBall 
                  value={myScore.bid} 
                  size="large" 
                  color={getRankColor(allPlayersWithScores.find(p => p.id === currentUser.id)?.total || 0, sortedTotals)} 
                  className="mb-4"
                />
                <div className="d-flex align-items-center justify-content-center gap-2 mt-1">
                  <RankBadge total={allPlayersWithScores.find(p => p.id === currentUser.id)?.total || 0} sortedTotals={sortedTotals} />
                  <div className="fw-bold" style={{ color: getRankColor(allPlayersWithScores.find(p => p.id === currentUser.id)?.total || 0, sortedTotals), fontSize: '1.05rem' }}>
                    {allPlayersWithScores.find(p => p.id === currentUser.id)?.total || 0} pts
                  </div>
                </div>
              </div>

              <div className="d-flex flex-column gap-2" style={{ width: "27%" }}>
                {[6, 7, 8, 9, 10].map(renderHistoryItem)}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="glass-card p-4 shadow-sm mb-4">
        <div className="text-center">
          <h5 className="mb-4 text-muted fw-bold">다른 플레이어</h5>
          <div className="row g-3 justify-content-center px-1">
            {otherScores.map(score => {
              const player = allPlayersWithScores.find(p => p.id === score.user_id);
              const rankColor = getRankColor(player?.total || 0, sortedTotals);

              return (
                <div key={score.user_id} className="col-4 d-flex flex-column align-items-center text-center">
                  <div className="mb-2"><RankBadge total={player?.total || 0} sortedTotals={sortedTotals} /></div>
                  <LotteryBall value={score.bid} color={rankColor} className="mb-2" />
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
          <div className="bg-white p-4 rounded-4 shadow-lg text-center mx-3 pop-in" style={{ minWidth: "300px", maxWidth: "400px" }}>
            <div style={{ fontSize: "3rem", marginBottom: "10px" }}>
              {showRankPopup.rank === 1 ? "👑" : showRankPopup.isUp ? "🚀" : showRankPopup.isUp === false ? "😢" : "👏"}
            </div>
            <h5 className="fw-bold mb-2 text-accent">{showRankPopup.round} 라운드 종료!</h5>
            <h3 className="fw-900 mb-4">현재 <span style={{ color: getRankColor(sortedTotals[showRankPopup.rank - 1] || 0, sortedTotals) }}>{showRankPopup.rank}위</span> 입니다</h3>

            {showRankPopup.isUp === true && <div className="text-success fw-bold mb-4 fs-5">순위가 올랐습니다! 📈</div>}
            {showRankPopup.isUp === false && <div className="text-danger fw-bold mb-4 fs-5">순위가 떨어졌습니다 📉</div>}
            {showRankPopup.isUp === null && <div className="text-muted fw-bold mb-4 fs-5">순위 유지 중! ➖</div>}

            <button className="btn btn-primary px-5 py-2 rounded-pill fw-bold w-100 fs-5" onClick={() => setShowRankPopup(null)}>확인</button>
          </div>
        </div>
      )}


    </div>
  );
}
