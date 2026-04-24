import { useState, useEffect } from "react";
import { fetchUsers, createSkullKingGame, fetchActiveSkullKingGame, updateSkullKingScore, addPlayerToSkullKingGame, endSkullKingGame } from "../api/gameApi";
import LoadingSpinner from "../components/LoadingSpinner";

function NumberStepper({ id, initialValue, min, max, step = 1, placeholder }: any) {
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
    <div className="input-group stepper-container shadow-sm">
      <button 
        className="btn btn-stepper left" 
        type="button" 
        onClick={() => adjust(-step)}
      >
        −
      </button>
      <input 
        type="number" 
        className="form-control stepper-input text-center" 
        id={id}
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
        min={min}
        max={max}
        placeholder={placeholder}
      />
      <button 
        className="btn btn-stepper right" 
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleStartGame = async () => {
    if (selectedUserIds.length < 2) {
      alert("최소 2명의 플레이어가 필요합니다.");
      return;
    }
    setIsSubmitting(true);
    try {
      const newGame = await createSkullKingGame(selectedUserIds);
      const fullGame = await fetchActiveSkullKingGame(); // Get with scores
      setActiveGame(fullGame);
    } catch (err) {
      alert("게임 시작 실패");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveRound = async (round: number) => {
    // Validation: Check if bonus is given when bid != actual
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
      alert(`예측에 실패한 플레이어는 보너스 점수를 받을 수 없습니다:\n${invalidPlayers.join(", ")}`);
      return;
    }

    setIsSubmitting(true);
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
      alert(`${round} 라운드 저장 완료!`);
    } catch (err) {
      alert("라운드 저장 실패");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddPlayer = async (userId: number) => {
    setIsSubmitting(true);
    try {
      await addPlayerToSkullKingGame(activeGame.id, userId);
      const updatedGame = await fetchActiveSkullKingGame();
      setActiveGame(updatedGame);
      alert("플레이어가 추가되었습니다.");
    } catch (err: any) {
      alert(err.message || "플레이어 추가 실패");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEndGame = async () => {
    if (!window.confirm("게임을 종료하시겠습니까?")) return;
    try {
      await endSkullKingGame(activeGame.id);
      setActiveGame(null);
    } catch (err) {
      alert("게임 종료 실패");
    }
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
            disabled={isSubmitting || selectedUserIds.length < 2}
          >
            {isSubmitting ? "게임 생성 중..." : "게임 시작하기"}
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
  const players = Array.from(new Set(activeGame.scores.map((s: any) => s.user_id))).map(id => {
    return activeGame.scores.find((s: any) => s.user_id === id)?.user;
  });

  return (
    <div className="container-fluid py-4" style={{ maxWidth: "1200px" }}>
      <div className="glass-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold m-0">스컬킹 관리 모드</h2>
            <div className="text-muted small mt-1">게임 진행 중 플레이어 추가 가능</div>
          </div>
          <div className="d-flex gap-2">
            <div className="dropdown">
              <button className="btn btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                플레이어 추가
              </button>
              <ul className="dropdown-menu dropdown-menu-end p-2" style={{ minWidth: "200px" }}>
                <li className="dropdown-header">추가할 유저 선택</li>
                {users
                  .filter(u => !players.some(p => p.id === u.id))
                  .map(user => (
                    <li key={user.id}>
                      <button className="dropdown-item rounded-3" onClick={() => handleAddPlayer(user.id)}>
                        {user.name} 추가
                      </button>
                    </li>
                  ))}
                {users.filter(u => !players.some(p => p.id === u.id)).length === 0 && (
                  <li className="dropdown-item disabled text-muted">추가 가능한 유저 없음</li>
                )}
              </ul>
            </div>
            <button className="btn btn-outline-danger" onClick={handleEndGame}>게임 종료</button>
          </div>
        </div>

        <div className="accordion" id="roundAccordion">
          {[...Array(10)].map((_, i) => {
            const round = i + 1;
            return (
              <div className="accordion-item glass-card mb-3 border-0" key={round}>
                <h2 className="accordion-header">
                  <button className="accordion-button collapsed bg-transparent fw-bold" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse${round}`}>
                    Round {round} 입력
                  </button>
                </h2>
                <div id={`collapse${round}`} className="accordion-collapse collapse" data-bs-parent="#roundAccordion">
                  <div className="accordion-body">
                    <div className="table-responsive">
                      <table className="table table-borderless align-middle">
                        <thead>
                          <tr className="text-muted small uppercase">
                            <th className="ps-3">플레이어</th>
                            <th style={{ width: "160px" }}>예측(Bid)</th>
                            <th style={{ width: "160px" }}>실제(Actual)</th>
                            <th style={{ width: "180px" }}>보너스</th>
                          </tr>
                        </thead>
                        <tbody>
                          {players.map(p => {
                            const score = activeGame.scores.find((s: any) => s.round === round && s.user_id === p.id);
                            return (
                              <tr key={p.id}>
                                <td className="ps-3 align-middle fw-bold" style={{ fontSize: "1.1rem" }}>{p.name}</td>
                                <td>
                                  <NumberStepper 
                                    id={`bid-${round}-${p.id}`}
                                    initialValue={score?.bid || 0}
                                    min={0}
                                    max={10}
                                  />
                                </td>
                                <td>
                                  <NumberStepper 
                                    id={`actual-${round}-${p.id}`}
                                    initialValue={score?.actual === -1 ? 0 : score.actual}
                                    min={0}
                                    max={10}
                                    placeholder="?"
                                  />
                                </td>
                                <td>
                                  <NumberStepper 
                                    id={`bonus-${round}-${p.id}`}
                                    initialValue={score?.bonus || 0}
                                    min={0}
                                    max={150}
                                    step={10}
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="text-end mt-4">
                      <button 
                        className="btn btn-primary px-5 py-2 shadow" 
                        onClick={() => handleSaveRound(round)}
                        disabled={isSubmitting}
                        style={{ borderRadius: "10px" }}
                      >
                        {isSubmitting ? (
                          <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> 저장 중...</>
                        ) : (
                          `${round} 라운드 전체 저장`
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`
        .stepper-container {
          border-radius: 10px;
          overflow: hidden;
          background: rgba(255,255,255,0.5);
          border: 1px solid rgba(0,0,0,0.05);
        }
        .stepper-input {
          border: none !important;
          background: transparent !important;
          font-weight: 700;
          font-size: 1.1rem;
          color: var(--text-main);
          box-shadow: none !important;
        }
        .btn-stepper {
          border: none !important;
          background: rgba(0,0,0,0.03) !important;
          color: var(--text-main) !important;
          font-weight: 800;
          width: 40px;
          transition: all 0.2s;
        }
        .btn-stepper:hover {
          background: rgba(0,0,0,0.08) !important;
        }
        .btn-stepper:active {
          transform: scale(0.9);
        }
        .btn-stepper.left {
          border-right: 1px solid rgba(0,0,0,0.05) !important;
        }
        .btn-stepper.right {
          border-left: 1px solid rgba(0,0,0,0.05) !important;
        }
        /* Hide arrows in chrome/safari/edge */
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        /* Hide arrows in firefox */
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
}
