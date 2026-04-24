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
  const [error, setError] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const fetchingRef = useRef(false);

  const fetchData = async (isInitial = false) => {
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
    fetchData(true);
  }, []); // Only initial fetch on mount

  useEffect(() => {
    let timer: any;
    if (!hasError && !isLoading) {
      timer = setInterval(() => fetchData(false), 3000);
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

  // Sort: Me first, then others by rank
  const playersInOrder = [...allPlayersWithScores].sort((a, b) => {
    if (currentUser && a.id === currentUser.id) return -1;
    if (currentUser && b.id === currentUser.id) return 1;
    return b.total - a.total; // Rank order for others
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

  const getScoreFor = (round: number, userId: number) => {
    return game.scores.find(s => s.round === round && s.user_id === userId);
  };

  return (
    <div className="container-fluid py-4 fade-in" style={{ maxWidth: "1200px" }}>
      <div className="glass-card p-4 shadow-lg overflow-hidden">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="fw-bold m-0" style={{ letterSpacing: "-1px" }}>
            💀 SKULL KING <span className="text-accent">SCOREBOARD</span>
          </h1>
          <div className="badge bg-primary px-3 py-2">LIVE</div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="table-responsive">
          <table className="table table-borderless align-middle custom-sk-table">
            <thead>
              <tr className="border-bottom text-center">
                <th className="sticky-col-name text-start ps-3" style={{ width: "85px" }}>PLAYER</th>
                <th className="sticky-col-pts" style={{ width: "55px" }}>PTS</th>
                {[...Array(10)].map((_, i) => (
                  <th key={i} className="round-col">R{i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {playersInOrder.map((p, pIndex) => (
                <tr key={p.id} className="border-bottom-subtle">
                  <td className="sticky-col-name ps-2">
                    <div className="d-flex align-items-center gap-1 overflow-hidden">
                      {getRankBadge(p.total)}
                      <div className="player-name">{p.name?.slice(0, 3)}</div>
                    </div>
                  </td>
                  <td className="sticky-col-pts text-center">
                    <div className="player-total-pill">
                      <div 
                        className="player-total-inline fw-900" 
                        style={{ color: getRankColor(p.total) }}
                      >
                        {p.total}
                      </div>
                    </div>
                  </td>
                  {[...Array(10)].map((_, i) => {
                    const round = i + 1;
                    const score = getScoreFor(round, p.id);
                    const isRecorded = score && score.actual !== -1;
                    return (
                      <td key={round} className="text-center p-1">
                        {score ? (
                          <div className={`score-cell ${isRecorded ? 'recorded' : 'pending'}`}>
                            <div className="bid-actual">
                              <span className="bid">{score.bid}</span>
                              <span className="separator">/</span>
                              <span className="actual">{isRecorded ? score.actual : '?'}</span>
                            </div>
                            {isRecorded && (
                              <div className={`round-points ${score.points >= 0 ? 'text-success' : 'text-danger'}`}>
                                {score.points > 0 ? `+${score.points}` : score.points}
                                {score.bonus > 0 && <span className="bonus-pill">+{score.bonus}</span>}
                              </div>
                            )}
                          </div>
                        ) : '-'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .custom-sk-table {
          color: var(--text-main);
          min-width: 800px; /* Base width for rounds R1-R10 + Total */
          table-layout: fixed;
        }
        .table-responsive {
          border-radius: 12px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        /* Sticky Columns */
        .sticky-col-name {
          position: sticky;
          left: 0;
          background: white !important;
          z-index: 2;
          width: 85px !important;
          border-right: 1px solid rgba(0,0,0,0.03);
        }
        .sticky-col-pts {
          position: sticky;
          left: 85px; /* width of sticky-col-name */
          background: #fdfdfd !important;
          z-index: 2;
          width: 55px !important;
          box-shadow: 2px 0 5px rgba(0,0,0,0.05);
          border-right: 1px solid rgba(0,0,0,0.06); /* Subtle separator line */
        }
        thead .sticky-col-name, thead .sticky-col-pts {
          z-index: 3;
        }

        .round-col {
          width: 60px;
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .rank-badge {
          font-size: 0.55rem;
          font-weight: 800;
          color: white;
          padding: 1px 4px;
          border-radius: 4px;
          text-transform: uppercase;
          flex-shrink: 0;
        }
        .player-name {
          font-size: 1.0rem;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .player-total-inline {
          font-size: 1.05rem; /* Slightly smaller to fit 4 digits */
          font-weight: 900;
          flex-shrink: 0;
          text-align: center;
          line-height: 1;
        }
        .player-total-pill {
          background: rgba(0, 0, 0, 0.05);
          padding: 6px 2px;
          border-radius: 8px;
          width: 48px;
          margin: 0 auto;
        }
        .score-cell {
          padding: 4px 1px;
          border-radius: 8px;
          min-height: 42px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden; /* Prevent overflow */
        }
        .score-cell.recorded {
          background: rgba(0, 0, 0, 0.03);
        }
        .bid-actual {
          font-size: 0.9rem;
          font-weight: 700;
          line-height: 1.1;
          white-space: nowrap; /* Keep bid/actual on one line */
        }
        .separator {
          margin: 0;
          color: var(--text-muted);
          font-weight: 300;
        }
        .round-points {
          font-size: 0.65rem;
          font-weight: 800;
          margin-top: 1px;
          line-height: 1;
        }
        .bonus-pill {
          font-size: 0.55rem;
          background: #ffd700;
          color: #000;
          padding: 0px 2px;
          border-radius: 4px;
          display: inline-block;
          margin-top: 1px;
        }
        .border-bottom-subtle {
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .text-accent {
          color: var(--accent-color);
        }

        @media (max-width: 768px) {
          .glass-card { padding: 0.5rem !important; }
          h1 { font-size: 1.2rem !important; }
          .sticky-col-name { width: 80px !important; }
          .sticky-col-pts { width: 40px !important; left: 80px; }
          .round-col { width: 50px; }
          .player-name { font-size: 0.9rem; }
          .player-total-inline { font-size: 1rem; }
          .bid-actual { font-size: 0.85rem; }
        }
      `}</style>
    </div>
  );
}
