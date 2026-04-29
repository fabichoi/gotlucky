import { useState, useEffect } from "react";
import { fetchSkullKingHistory, deleteSkullKingGame } from "../api/gameApi";
import LoadingSpinner from "../components/LoadingSpinner";
import { useUser } from "../context/UserContext";
import { SkullKingGame } from "../types/skullKing";
import { calculatePlayerTotals, getRankColor } from "../utils/skullKingUtils";

export default function SkullKingHistory() {
  const { user } = useUser();
  const [history, setHistory] = useState<SkullKingGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedGameId, setExpandedGameId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const data = await fetchSkullKingHistory();
      setHistory(data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (gameId: number) => {
    if (!window.confirm("이 게임 기록을 영구적으로 삭제하시겠습니까?")) return;
    try {
      await deleteSkullKingGame(gameId);
      await fetchData();
    } catch (err) {
      alert("삭제 실패");
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="container py-4 fade-in" style={{ maxWidth: "1000px" }}>
      <div className="glass-card p-4 shadow-lg">
        <h1 className="fw-bold mb-4">
          💀 SKULL KING <span className="text-accent">HISTORY</span>
        </h1>

        {history.length === 0 ? (
          <div className="text-center py-5 text-muted">아직 종료된 게임 기록이 없습니다.</div>
        ) : (
          <div className="list-group gap-3">
            {history.map((game) => {
              // History games are always finished, so all rounds are completed
              const completedRounds = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
              const playerTotals = calculatePlayerTotals(game.scores, completedRounds).sort(
                (a, b) => b.total - a.total
              );
              const sortedTotals = playerTotals.map((p) => p.total);
              const isExpanded = expandedGameId === game.id;

              return (
                <div
                  key={game.id}
                  className="list-group-item glass-card border-0 p-4 shadow-sm position-relative overflow-hidden"
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-muted small fw-bold">
                      {new Date(game.created_at).toLocaleString()}
                    </span>
                    <div className="d-flex align-items-center gap-2">
                      <button
                        className="btn btn-sm btn-light rounded-pill px-3 fw-bold shadow-sm"
                        onClick={() => setExpandedGameId(isExpanded ? null : game.id)}
                      >
                        {isExpanded ? "접기 ▲" : "상세 보기 ▼"}
                      </button>
                      <span className="badge bg-secondary rounded-pill px-3">FINISHED</span>
                      {user?.role === "admin" && (
                        <button
                          className="btn btn-outline-danger btn-sm border-0 p-1"
                          onClick={() => handleDelete(game.id)}
                          title="기록 삭제"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="row g-3 mb-2">
                    {playerTotals.map((p, idx) => (
                      <div key={p.id} className="col-md-3 col-6">
                        <div className="p-2 rounded-4 bg-light text-center border h-100 d-flex flex-column justify-content-center">
                          <div className="small text-muted fw-bold mb-1">{idx + 1}등</div>
                          <div className="fw-bold text-truncate mb-1">{p.name}</div>
                          <div
                            className="fw-900 fs-5"
                            style={{ color: getRankColor(p.total, sortedTotals) }}
                          >
                            {p.total} pts
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-top fade-in overflow-auto">
                      <h5 className="fw-bold mb-3">라운드별 상세 점수</h5>
                      <div className="table-responsive">
                        <table
                          className="table table-sm table-hover text-center align-middle"
                          style={{ minWidth: "600px" }}
                        >
                          <thead>
                            <tr className="table-light">
                              <th style={{ width: "80px" }}>라운드</th>
                              {playerTotals.map((p) => (
                                <th
                                  key={p.id}
                                  style={{ color: getRankColor(p.total, sortedTotals) }}
                                >
                                  {p.name}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((round) => (
                              <tr key={round}>
                                <td className="fw-bold text-muted small">{round} 라운드</td>
                                {playerTotals.map((p) => {
                                  const score = game.scores.find(
                                    (s) => s.user_id === p.id && s.round === round
                                  );
                                  const points = score?.points || 0;
                                  return (
                                    <td key={p.id}>
                                      <div className="d-flex flex-column">
                                        <span
                                          className="fw-bold"
                                          style={{
                                            color:
                                              points > 0
                                                ? "#ef4444"
                                                : points < 0
                                                ? "#3b82f6"
                                                : "var(--text-main)",
                                          }}
                                        >
                                          {points > 0 ? `+${points}` : points}
                                        </span>
                                        <span className="text-muted" style={{ fontSize: "0.65rem" }}>
                                          Bid: {score?.bid} / Get: {score?.actual}
                                        </span>
                                      </div>
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
