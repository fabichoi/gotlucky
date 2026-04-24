import { useState, useEffect } from "react";
import { fetchSkullKingHistory, deleteSkullKingGame } from "../api/gameApi";
import LoadingSpinner from "../components/LoadingSpinner";
import { useUser } from "../context/UserContext";

export default function SkullKingHistory() {
  const { user } = useUser();
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      <div className="glass-card p-4">
        <h1 className="fw-bold mb-4">💀 SKULL KING <span className="text-accent">HISTORY</span></h1>
        
        {history.length === 0 ? (
          <div className="text-center py-5 text-muted">아직 종료된 게임 기록이 없습니다.</div>
        ) : (
          <div className="list-group gap-3">
            {history.map((game) => {
              // Group scores by user and calculate totals
              const playerTotals = Array.from(new Set(game.scores.map((s: any) => s.user_id))).map(id => {
                const userScores = game.scores.filter((s: any) => s.user_id === id);
                const total = userScores.reduce((sum: number, s: any) => sum + s.points, 0);
                return { name: userScores[0]?.user?.name, total };
              }).sort((a, b) => b.total - a.total);

              return (
                <div key={game.id} className="list-group-item glass-card border-0 p-4 shadow-sm position-relative">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-muted small">{new Date(game.created_at).toLocaleString()}</span>
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-secondary">FINISHED</span>
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
                  <div className="row g-3">
                    {playerTotals.map((p, idx) => (
                      <div key={p.name} className="col-md-3 col-6">
                        <div className="p-2 rounded-3 bg-light text-center">
                          <div className="small text-muted">{idx + 1}등</div>
                          <div className="fw-bold">{p.name}</div>
                          <div className="text-primary fw-bold">{p.total} pts</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`
        .text-accent { color: var(--accent-color); }
        .bg-light { background: rgba(0,0,0,0.03) !important; }
      `}</style>
    </div>
  );
}
