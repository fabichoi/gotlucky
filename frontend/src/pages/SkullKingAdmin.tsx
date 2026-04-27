import { useState, useEffect } from "react";
import { fetchUsers, createSkullKingGame, fetchActiveSkullKingGame, updateSkullKingScore, addPlayerToSkullKingGame, endSkullKingGame } from "../api/gameApi";
import LoadingSpinner from "../components/LoadingSpinner";

function CompactStepper({ id, initialValue, min, max, step = 1, isBonus = false }: any) {
  const [value, setValue] = useState<number | string>(initialValue === -1 ? "" : initialValue);

  useEffect(() => {
    setValue(initialValue === -1 ? "" : initialValue);
  }, [initialValue]);

  const adjust = (amount: number) => {
    let current = value === "" ? 0 : Number(value);
    let next = current + amount;
    if (next < min) next = min;
    if (next > max) next = max;
    setValue(next);
  };

  return (
    <div className="d-flex align-items-center justify-content-between bg-white rounded-pill shadow-sm p-1 border" style={{ width: "100%", maxWidth: "125px", margin: "0 auto" }}>
      <button
        className="btn btn-light rounded-circle d-flex align-items-center justify-content-center"
        style={{ width: "36px", height: "36px", fontWeight: "900", color: "var(--text-main)", fontSize: "1.2rem", padding: 0 }}
        type="button"
        onClick={() => adjust(-step)}
      >
        −
      </button>
      <input
        type="number"
        id={id}
        className="form-control border-0 p-0 text-center fw-900 bg-transparent"
        style={{ width: isBonus ? "36px" : "30px", fontSize: isBonus ? "0.95rem" : "1.2rem", color: "var(--text-main)" }}
        value={value}
        onChange={(e) => {
          const val = e.target.value;
          if (val === "") {
            setValue("");
          } else {
            const num = parseInt(val);
            if (!isNaN(num)) setValue(num);
          }
        }}
      />
      <button
        className="btn btn-light rounded-circle d-flex align-items-center justify-content-center"
        style={{ width: "36px", height: "36px", fontWeight: "900", color: "var(--text-main)", fontSize: "1.2rem", padding: 0 }}
        type="button"
        onClick={() => adjust(step)}
      >
        +
      </button>
    </div>
  );
}

export default function SkullKingAdmin() {
  const [activeGame, setActiveGame] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingTarget, setLoadingTarget] = useState<string | null>(null);
  const [sharedRounds, setSharedRounds] = useState<Set<number>>(new Set());
  const [selectedRound, setSelectedRound] = useState<number>(1);
  const [modalConfig, setModalConfig] = useState<{ message: string; onConfirm?: () => void } | null>(null);

  const showAlert = (message: string) => setModalConfig({ message });
  const showConfirm = (message: string, onConfirm: () => void) => setModalConfig({ message, onConfirm });

  useEffect(() => {
    const init = async () => {
      try {
        const [gameData, userData] = await Promise.all([
          fetchActiveSkullKingGame(),
          fetchUsers()
        ]);
        setActiveGame(gameData);
        setUsers(userData);
      } catch (err) {
        console.error("Initialization failed:", err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (activeGame && activeGame.scores) {
      let defaultRound = 1;
      for (let r = 1; r <= 10; r++) {
        const roundScores = activeGame.scores.filter((s: any) => s.round === r);
        if (roundScores.length > 0 && roundScores.some((s: any) => s.actual === -1)) {
          defaultRound = r;
          break;
        }
        if (r === 10) defaultRound = 10;
      }
      setSelectedRound(defaultRound);
    }
  }, [activeGame]);

  const handleStartGame = async () => {
    if (selectedUserIds.length < 2) {
      showAlert("최소 2명의 플레이어가 필요합니다.");
      return;
    }
    setLoadingTarget('start_game');
    try {
      await createSkullKingGame(selectedUserIds);
      const fullGame = await fetchActiveSkullKingGame(); // Get with scores
      setActiveGame(fullGame);
    } catch (err) {
      showAlert("게임 시작 실패");
    } finally {
      setLoadingTarget(null);
    }
  };

  const handleSaveRound = async (round: number) => {
    // Get players logic inside since we're using activeGame state directly
    const players = Array.from(new Set(activeGame.scores.map((s: any) => s.user_id))).map((id: any) => {
      return activeGame.scores.find((s: any) => s.user_id === id)?.user;
    });

    const invalidPlayers: string[] = [];
    players.forEach(p => {
      const bid = parseInt((document.getElementById(`bid-${round}-${p.id}`) as HTMLInputElement).value) || 0;
      const actualVal = (document.getElementById(`actual-${round}-${p.id}`) as HTMLInputElement).value;
      const actual = actualVal === "" ? -1 : parseInt(actualVal);
      const bonus = parseInt((document.getElementById(`bonus-${round}-${p.id}`) as HTMLInputElement).value) || 0;

      if (actual !== -1) {
        if (bid !== actual && bonus > 0) {
          invalidPlayers.push(`${p.name} (예측 실패)`);
        } else if (actual === 0 && bonus > 0) {
          invalidPlayers.push(`${p.name} (제로 비딩은 보너스 불가)`);
        }
      }
    });

    if (invalidPlayers.length > 0) {
      showAlert(`예측에 실패한 플레이어는 보너스 점수를 받을 수 없습니다:\n${invalidPlayers.join(", ")}`);
      return;
    }

    setLoadingTarget(`save_round_${round}`);
    try {
      const updatePromises = players.map(p => {
        const bid = parseInt((document.getElementById(`bid-${round}-${p.id}`) as HTMLInputElement).value) || 0;
        const actualVal = (document.getElementById(`actual-${round}-${p.id}`) as HTMLInputElement).value;
        const actual = actualVal === "" ? -1 : parseInt(actualVal);
        const bonus = parseInt((document.getElementById(`bonus-${round}-${p.id}`) as HTMLInputElement).value) || 0;

        return updateSkullKingScore({
          game_id: activeGame.id,
          user_id: p.id,
          round,
          bid,
          actual,
          bonus
        });
      });

      await Promise.all(updatePromises);
      const updatedGame = await fetchActiveSkullKingGame();
      setActiveGame(updatedGame);
      showAlert(`${round} 라운드 저장 완료!`);
    } catch (err) {
      showAlert("라운드 저장 실패");
    } finally {
      setLoadingTarget(null);
    }
  };

  const handleSaveBidsOnly = async (round: number) => {
    const players = Array.from(new Set(activeGame.scores.map((s: any) => s.user_id))).map((id: any) => {
      return activeGame.scores.find((s: any) => s.user_id === id)?.user;
    });

    setLoadingTarget(`save_bids_${round}`);
    try {
      const updatePromises = players.map(p => {
        const bid = parseInt((document.getElementById(`bid-${round}-${p.id}`) as HTMLInputElement).value) || 0;
        const score = activeGame.scores.find((s: any) => s.round === round && s.user_id === p.id);
        const actual = score?.actual !== -1 && score?.actual !== undefined ? score.actual : -1;
        const bonus = score?.bonus !== undefined ? score.bonus : 0;

        return updateSkullKingScore({
          game_id: activeGame.id,
          user_id: p.id,
          round,
          bid,
          actual,
          bonus
        });
      });

      await Promise.all(updatePromises);
      const updatedGame = await fetchActiveSkullKingGame();
      setActiveGame(updatedGame);
      setSharedRounds(prev => new Set(prev).add(round));
      showAlert(`${round} 라운드 예측이 확정되었습니다!`);
    } catch (err) {
      showAlert("예측 확정 실패");
    } finally {
      setLoadingTarget(null);
    }
  };

  const handleAddPlayer = async (userId: number) => {
    setLoadingTarget('add_player');
    try {
      await addPlayerToSkullKingGame(activeGame.id, userId);
      const updatedGame = await fetchActiveSkullKingGame();
      setActiveGame(updatedGame);
      showAlert("플레이어가 추가되었습니다.");
    } catch (err: any) {
      showAlert(err.message || "플레이어 추가 실패");
    } finally {
      setLoadingTarget(null);
    }
  };

  const handleEndGame = async () => {
    showConfirm("게임을 종료하시겠습니까?", async () => {
      try {
        await endSkullKingGame(activeGame.id);
        setActiveGame(null);
      } catch (err) {
        showAlert("게임 종료 실패");
      }
    });
  };

  if (isLoading) return <LoadingSpinner />;

  if (!activeGame) {
    const movePlayer = (index: number, direction: 'up' | 'down') => {
      const newList = [...selectedUserIds];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newList.length) return;

      [newList[index], newList[targetIndex]] = [newList[targetIndex], newList[index]];
      setSelectedUserIds(newList);
    };

    return (
      <div className="container py-5" style={{ maxWidth: "800px" }}>
        <div className="glass-card p-5">
          <h2 className="fw-bold mb-4">새로운 스컬킹 게임 시작</h2>

          <div className="mb-4">
            <label className="form-label fw-bold">플레이어 선택 (선택 순서대로 정렬됨)</label>
            <div className="row g-2 mb-4">
              {users.map(user => (
                <div key={user.id} className="col-md-4 col-6">
                  <div
                    className={`user-select-card p-3 text-center ${selectedUserIds.includes(user.id) ? 'selected' : ''}`}
                    onClick={() => {
                      if (selectedUserIds.includes(user.id)) {
                        setSelectedUserIds(selectedUserIds.filter(id => id !== user.id));
                      } else {
                        setSelectedUserIds([...selectedUserIds, user.id]);
                      }
                    }}
                  >
                    {user.name}
                  </div>
                </div>
              ))}
            </div>

            {selectedUserIds.length > 0 && (
              <div className="selected-order-list p-4 bg-light rounded-4">
                <label className="form-label fw-bold mb-3">플레이어 입장 순서 조절</label>
                {selectedUserIds.map((id, index) => {
                  const user = users.find(u => u.id === id);
                  return (
                    <div key={id} className="d-flex align-items-center justify-content-between bg-white p-2 mb-2 rounded-3 shadow-sm">
                      <div className="d-flex align-items-center">
                        <span className="badge bg-dark me-3">{index + 1}</span>
                        <span className="fw-bold">{user?.name}</span>
                      </div>
                      <div className="btn-group">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => movePlayer(index, 'up')}
                          disabled={index === 0}
                        >
                          ↑
                        </button>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => movePlayer(index, 'down')}
                          disabled={index === selectedUserIds.length - 1}
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button
            className="btn btn-primary w-100 py-3 mt-3"
            onClick={handleStartGame}
            disabled={loadingTarget !== null || selectedUserIds.length < 2}
          >
            {loadingTarget === 'start_game' ? "게임 생성 중..." : "게임 시작하기"}
          </button>
        </div>
        <style>{`
          .user-select-card {
            background: rgba(0,0,0,0.03);
            border: 2px solid transparent;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .user-select-card.selected {
            background: var(--accent-color);
            color: white;
            border-color: var(--accent-color);
          }
        `}</style>
      </div>
    );
  }

  // Active game UI
  const players = Array.from(new Set(activeGame.scores.map((s: any) => s.user_id))).map((id: any) => {
    return activeGame.scores.find((s: any) => s.user_id === id)?.user;
  });

  const allPlayersWithScores = players.map((p: any) => {
    const total = activeGame.scores
      .filter((s: any) => s.user_id === p.id && s.actual !== -1)
      .reduce((sum: number, s: any) => sum + s.points, 0);
    return { id: p.id, name: p.name, total };
  });

  const playersInOrder = allPlayersWithScores;
  const sortedScores = [...allPlayersWithScores].map(p => p.total).sort((a, b) => b - a);

  const getRankColor = (total: number) => {
    const rankIndex = sortedScores.indexOf(total);
    const rainbow = ["#ff4d4d", "#ffa64d", "#ffdb4d", "#4dff88", "#4d94ff", "#804dff", "#db4dff"];
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

  return (
    <div className="container-fluid py-4 fade-in" style={{ maxWidth: "800px" }}>
      <div className="d-flex justify-content-between align-items-center mb-4 px-2">
        <div>
          <h1 className="fw-bold m-0" style={{ letterSpacing: "-1px" }}>
            💀 SKULL KING <span className="text-accent">ADMIN</span>
          </h1>
        </div>
        <div className="d-flex gap-2">
          <div className="dropdown">
            <button className="btn btn-sm btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
              + 유저
            </button>
            <ul className="dropdown-menu dropdown-menu-end p-2" style={{ minWidth: "200px" }}>
              <li className="dropdown-header">추가할 유저 선택</li>
              {users
                .filter(u => !players.some((p: any) => p.id === u.id))
                .map(user => (
                  <li key={user.id}>
                    <button className="dropdown-item rounded-3" onClick={() => handleAddPlayer(user.id)}>
                      {user.name} 추가
                    </button>
                  </li>
                ))}
              {users.filter(u => !players.some((p: any) => p.id === u.id)).length === 0 && (
                <li className="dropdown-item disabled text-muted">추가 가능한 유저 없음</li>
              )}
            </ul>
          </div>
          <button className="btn btn-sm btn-outline-danger" onClick={handleEndGame}>종료</button>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4 bg-white rounded-pill p-2 shadow-sm border mx-2">
        <button
          className="btn btn-light rounded-circle shadow-sm d-flex align-items-center justify-content-center"
          style={{ width: "45px", height: "45px", fontWeight: "900", fontSize: "1.2rem" }}
          onClick={() => setSelectedRound(r => Math.max(1, r - 1))}
          disabled={selectedRound === 1}
        >
          {"<"}
        </button>
        <h4 className="fw-bold m-0 text-accent">Round {selectedRound}</h4>
        <button
          className="btn btn-light rounded-circle shadow-sm d-flex align-items-center justify-content-center"
          style={{ width: "45px", height: "45px", fontWeight: "900", fontSize: "1.2rem" }}
          onClick={() => setSelectedRound(r => Math.min(10, r + 1))}
          disabled={selectedRound === 10}
        >
          {">"}
        </button>
      </div>

      <div className="row g-2 px-2">
        {playersInOrder.map((p: any) => {
          const score = activeGame.scores.find((s: any) => s.round === selectedRound && s.user_id === p.id);
          return (
            <div key={p.id} className="col-6 col-md-4 col-lg-3">
              <div className="glass-card p-2 mb-2 border-0 shadow-sm position-relative overflow-hidden h-100" style={{ borderRadius: "20px" }}>

                {/* Top Row: User + Bid */}
                <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                  <div className="d-flex flex-column align-items-center justify-content-center w-50">
                    <div className="d-flex align-items-center justify-content-center gap-1 mb-1">
                      {getRankBadge(p.total)}
                      <span className="fw-bold text-truncate" style={{ color: "var(--text-main)", maxWidth: "65px", fontSize: "0.95rem" }}>{p.name}</span>
                    </div>
                    <div className="fw-900" style={{ color: getRankColor(p.total), fontSize: "1.05rem" }}>{p.total} pts</div>
                  </div>

                  <div className="d-flex flex-column align-items-center w-50">
                    <div className="small text-muted mb-1 fw-bold" style={{ fontSize: "0.7rem" }}>예측(Bid)</div>
                    <CompactStepper
                      id={`bid-${selectedRound}-${p.id}`}
                      initialValue={score?.bid || 0}
                      min={0}
                      max={10}
                    />
                  </div>
                </div>

                {/* Bottom Row: Bonus + Actual */}
                <div className="d-flex gap-1 pt-1 text-center">
                  <div className="w-50">
                    <div className="small text-muted mb-1 fw-bold" style={{ fontSize: "0.7rem" }}>보너스</div>
                    <CompactStepper
                      id={`bonus-${selectedRound}-${p.id}`}
                      initialValue={score?.bonus || 0}
                      min={0}
                      max={150}
                      step={10}
                      isBonus={true}
                    />
                  </div>
                  <div className="w-50">
                    <div className="small text-muted mb-1 fw-bold" style={{ fontSize: "0.7rem" }}>실제(Actual)</div>
                    <CompactStepper
                      id={`actual-${selectedRound}-${p.id}`}
                      initialValue={score?.actual === -1 ? 0 : score.actual}
                      min={0}
                      max={10}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass-card p-3 mt-4 mx-2 shadow-sm border-0 bg-white">
        <div className="d-grid gap-2 d-md-flex justify-content-md-end align-items-md-center">
          <button
            className="btn btn-outline-primary py-3 py-md-2 px-md-4 shadow-sm fw-bold rounded-4"
            onClick={() => handleSaveBidsOnly(selectedRound)}
            disabled={loadingTarget !== null}
          >
            {loadingTarget === `save_bids_${selectedRound}` ? (
              <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> 공유 중...</>
            ) : (
              "예측(Bid) 확정"
            )}
          </button>
          <button
            className="btn btn-primary py-3 py-md-2 px-md-5 shadow fw-bold rounded-4"
            onClick={() => handleSaveRound(selectedRound)}
            disabled={loadingTarget !== null || !sharedRounds.has(selectedRound)}
          >
            {loadingTarget === `save_round_${selectedRound}` ? (
              <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> 저장 중...</>
            ) : (
              `${selectedRound} 라운드 결과 저장`
            )}
          </button>
        </div>
      </div>

      {modalConfig && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ zIndex: 1050, backdropFilter: "blur(5px)", backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white p-4 rounded-4 shadow-lg text-center mx-3" style={{ minWidth: "300px", maxWidth: "400px", animation: "popIn 0.2s ease-out" }}>
            <h5 className="fw-bold mb-3" style={{ color: "var(--text-main)" }}>알림</h5>
            <p className="mb-4 fw-bold text-muted" style={{ whiteSpace: "pre-wrap", fontSize: "0.95rem" }}>{modalConfig.message}</p>
            <div className="d-flex gap-2 justify-content-center">
              {modalConfig.onConfirm && (
                <button className="btn btn-light px-4 py-2 rounded-pill fw-bold" onClick={() => setModalConfig(null)}>취소</button>
              )}
              <button 
                className="btn btn-primary px-4 py-2 rounded-pill fw-bold" 
                onClick={() => {
                  if (modalConfig.onConfirm) modalConfig.onConfirm();
                  setModalConfig(null);
                }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes popIn {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
        .text-accent {
          color: var(--accent-color);
        }
        .fw-900 {
          font-weight: 900;
        }
        .btn-white {
          background: #ffffff;
          border: 1px solid rgba(0,0,0,0.05);
        }
        .btn-white:hover {
          background: #f8f9fa;
        }
        .btn-white:active {
          transform: scale(0.95);
        }
        .rank-badge {
          font-size: 0.7rem;
          font-weight: 800;
          color: white;
          padding: 2px 8px;
          border-radius: 6px;
          text-transform: uppercase;
        }
      `}</style>
    </div>
  );
}
