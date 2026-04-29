import { useState, useEffect, useCallback } from "react";
import {
  fetchUsers,
  createSkullKingGame,
  fetchActiveSkullKingGame,
  updateSkullKingScore,
  endSkullKingGame,
} from "../api/gameApi";
import LoadingSpinner from "../components/LoadingSpinner";
import { SkullKingGame, User, PlayerTotal, PlayerScore } from "../types/skullKing";
import {
  calculatePlayerTotals,
  getCompletedRounds,
  getRankColor,
} from "../utils/skullKingUtils";
import CompactStepper from "../components/skullking/CompactStepper";
import RankBadge from "../components/skullking/RankBadge";
import RoundQuickSelector from "../components/skullking/RoundQuickSelector";
import SkullKingModal from "../components/skullking/SkullKingModal";

export default function SkullKingAdmin() {
  const [activeGame, setActiveGame] = useState<SkullKingGame | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingTarget, setLoadingTarget] = useState<string | null>(null);
  const [sharedRounds, setSharedRounds] = useState<Set<number>>(new Set());
  const [selectedRound, setSelectedRound] = useState<number>(1);
  const [modalConfig, setModalConfig] = useState<{
    message: string;
    onConfirm?: () => void;
    title?: string;
  } | null>(null);

  // Local state for current round inputs to avoid DOM access
  const [roundInputs, setRoundInputs] = useState<Record<number, { bid: number; actual: number | string; bonus: number }>>({});

  const showAlert = (message: string, title?: string) => setModalConfig({ message, title });
  const showConfirm = (message: string, onConfirm: () => void, title?: string) =>
    setModalConfig({ message, onConfirm, title });

  const refreshGameData = useCallback(async () => {
    try {
      const gameData = await fetchActiveSkullKingGame();
      setActiveGame(gameData);

      // Initialize inputs from game data
      if (gameData) {
        const newInputs: typeof roundInputs = {};
        gameData.scores.forEach((s: PlayerScore) => {
          if (s.round === selectedRound) {
            newInputs[s.user_id] = {
              bid: s.bid || 0,
              actual: s.actual === -1 ? 0 : s.actual,
              bonus: s.bonus || 0,
            };
          }
        });
        setRoundInputs(newInputs);
      }
    } catch (err) {
      console.error("Failed to refresh game data:", err);
    }
  }, [selectedRound]);

  useEffect(() => {
    const init = async () => {
      try {
        const [gameData, userData] = await Promise.all([
          fetchActiveSkullKingGame(),
          fetchUsers(),
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

  const [hasSetInitialRound, setHasSetInitialRound] = useState(false);

  useEffect(() => {
    if (activeGame && activeGame.scores && !hasSetInitialRound) {
      let defaultRound = 1;
      for (let r = 1; r <= 10; r++) {
        const roundScores = activeGame.scores.filter((s) => s.round === r);
        if (
          roundScores.length > 0 &&
          roundScores.some((s) => s.actual === -1)
        ) {
          defaultRound = r;
          break;
        }
        if (r === 10) defaultRound = 10;
      }
      setSelectedRound(defaultRound);
      setHasSetInitialRound(true);
    }
  }, [activeGame, hasSetInitialRound]);

  // Sync inputs when round or activeGame changes
  useEffect(() => {
    if (activeGame) {
      const newInputs: typeof roundInputs = {};
      activeGame.scores.forEach((s) => {
        if (s.round === selectedRound) {
          newInputs[s.user_id] = {
            bid: s.bid || 0,
            actual: s.actual === -1 ? 0 : s.actual,
            bonus: s.bonus || 0,
          };
        }
      });
      setRoundInputs(newInputs);
    }
  }, [selectedRound, activeGame?.id]); // Only re-sync on round change or game change

  const handleStartGame = async () => {
    if (selectedUserIds.length < 2) {
      showAlert("최소 2명의 플레이어가 필요합니다.");
      return;
    }
    setLoadingTarget("start_game");
    try {
      await createSkullKingGame(selectedUserIds);
      await refreshGameData();
    } catch (err) {
      showAlert("게임 시작 실패");
    } finally {
      setLoadingTarget(null);
    }
  };

  const updateInput = (userId: number, field: keyof typeof roundInputs[number], value: any) => {
    setRoundInputs(prev => ({
      ...prev,
      [userId]: {
        ...(prev[userId] || { bid: 0, actual: "", bonus: 0 }),
        [field]: value
      }
    }));
  };

  const executeSaveRound = async (round: number) => {
    const players = Array.from(
      new Set(activeGame!.scores.map((s) => s.user_id))
    ).map((id) => {
      return activeGame!.scores.find((s) => s.user_id === id)?.user;
    });

    const invalidPlayers: string[] = [];
    players.forEach((p) => {
      if (!p) return;
      const inputs = roundInputs[p.id] || { bid: 0, actual: 0, bonus: 0 };
      const actual = Number(inputs.actual);
      const bid = inputs.bid;
      const bonus = inputs.bonus;

      if (actual !== -1) {
        if (bid !== actual && bonus > 0) {
          invalidPlayers.push(`${p.name} (예측 실패)`);
        } else if (actual === 0 && bonus > 0) {
          invalidPlayers.push(`${p.name} (제로 비딩은 보너스 불가)`);
        }
      }
    });

    if (invalidPlayers.length > 0) {
      showAlert(
        `예측에 실패한 플레이어는 보너스 점수를 받을 수 없습니다:\n${invalidPlayers.join(
          ", "
        )}`
      );
      return;
    }

    setLoadingTarget(`save_round_${round}`);
    try {
      const updatePromises = players.map((p) => {
        if (!p) return Promise.resolve();
        const inputs = roundInputs[p.id] || { bid: 0, actual: 0, bonus: 0 };
        const actual = Number(inputs.actual);

        return updateSkullKingScore({
          game_id: activeGame!.id,
          user_id: p.id,
          round,
          bid: inputs.bid,
          actual,
          bonus: inputs.bonus,
        });
      });

      await Promise.all(updatePromises);
      await refreshGameData();
      showAlert(`${round} 라운드 저장 완료!`);
      if (round < 10) {
        setSelectedRound(round + 1);
      }
    } catch (err) {
      showAlert("라운드 저장 실패");
    } finally {
      setLoadingTarget(null);
    }
  };

  const handleSaveRound = async (round: number) => {
    const isCompleted = activeGame!.scores
      .filter((s) => s.round === round)
      .every((s) => s.actual !== -1);

    if (isCompleted) {
      showConfirm(
        `${round} 라운드 결과가 이미 저장되어 있습니다.\n다시 저장하시겠습니까?`,
        () => executeSaveRound(round)
      );
    } else {
      executeSaveRound(round);
    }
  };

  const executeSaveBidsOnly = async (round: number) => {
    const players = Array.from(
      new Set(activeGame!.scores.map((s) => s.user_id))
    ).map((id) => {
      return activeGame!.scores.find((s) => s.user_id === id)?.user;
    });

    setLoadingTarget(`save_bids_${round}`);
    try {
      const updatePromises = players.map((p) => {
        if (!p) return Promise.resolve();
        const inputs = roundInputs[p.id] || { bid: 0, actual: -1, bonus: 0 };
        const score = activeGame!.scores.find(
          (s) => s.round === round && s.user_id === p.id
        );
        const actual = score?.actual !== -1 && score?.actual !== undefined ? score.actual : -1;

        return updateSkullKingScore({
          game_id: activeGame!.id,
          user_id: p.id,
          round,
          bid: inputs.bid,
          actual,
          bonus: inputs.bonus,
        });
      });

      await Promise.all(updatePromises);
      await refreshGameData();
      setSharedRounds((prev) => new Set(prev).add(round));
      showAlert(`${round} 라운드 예측이 확정되었습니다!`);
    } catch (err) {
      showAlert("예측 확정 실패");
    } finally {
      setLoadingTarget(null);
    }
  };

  const handleSaveBidsOnly = async (round: number) => {
    const isCompleted = activeGame!.scores
      .filter((s) => s.round === round)
      .every((s) => s.actual !== -1);

    if (sharedRounds.has(round) || isCompleted) {
      showConfirm(
        `${round} 라운드 예측이 이미 확정되었거나 결과가 존재합니다.\n다시 확정하시겠습니까?`,
        () => executeSaveBidsOnly(round)
      );
    } else {
      executeSaveBidsOnly(round);
    }
  };



  const handleEndGame = async () => {
    showConfirm("게임을 종료하시겠습니까?", async () => {
      try {
        await endSkullKingGame(activeGame!.id);
        setActiveGame(null);
      } catch (err) {
        showAlert("게임 종료 실패");
      }
    });
  };

  if (isLoading) return <LoadingSpinner />;

  if (!activeGame) {
    const movePlayer = (index: number, direction: "up" | "down") => {
      const newList = [...selectedUserIds];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
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
              {users.map((user) => (
                <div key={user.id} className="col-md-4 col-6">
                  <div
                    className={`user-select-card p-3 text-center ${selectedUserIds.includes(user.id) ? "selected" : ""
                      }`}
                    onClick={() => {
                      if (selectedUserIds.includes(user.id)) {
                        setSelectedUserIds(selectedUserIds.filter((id) => id !== user.id));
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
                  const user = users.find((u) => u.id === id);
                  return (
                    <div key={id} className="d-flex align-items-center justify-content-between bg-white p-2 mb-2 rounded-3 shadow-sm">
                      <div className="d-flex align-items-center">
                        <span className="badge bg-dark me-3">{index + 1}</span>
                        <span className="fw-bold">{user?.name}</span>
                      </div>
                      <div className="btn-group">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => movePlayer(index, "up")}
                          disabled={index === 0}
                        >
                          ↑
                        </button>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => movePlayer(index, "down")}
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
            {loadingTarget === "start_game" ? "게임 생성 중..." : "게임 시작하기"}
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

  // Active game UI calculations
  const players = Array.from(new Set(activeGame.scores.map((s) => s.user_id))).map((id) => {
    return activeGame.scores.find((s) => s.user_id === id)?.user;
  });

  const completedRounds = getCompletedRounds(activeGame.scores);
  const allPlayersWithScores = calculatePlayerTotals(activeGame.scores, completedRounds);
  const sortedTotals = [...allPlayersWithScores].map((p) => p.total).sort((a, b) => b - a);

  return (
    <div className="container-fluid py-4 fade-in" style={{ maxWidth: "800px" }}>
      <div className="d-flex justify-content-between align-items-center mb-4 px-2">
        <h1 className="fw-bold m-0" style={{ letterSpacing: "-1px" }}>
          💀 SKULL KING <span className="text-accent">ADMIN</span>
        </h1>
        <div className="d-flex gap-2">

          <button className="btn btn-sm btn-outline-danger" onClick={handleEndGame}>종료</button>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4 bg-white rounded-pill p-2 shadow-sm border mx-2">
        <button
          className="btn btn-light rounded-circle shadow-sm d-flex align-items-center justify-content-center"
          style={{ width: "45px", height: "45px", fontWeight: "900", fontSize: "1.2rem" }}
          onClick={() => setSelectedRound((r) => Math.max(1, r - 1))}
          disabled={selectedRound === 1}
        >
          {"<"}
        </button>
        <div className="text-center">
          <h4 className="fw-bold m-0 text-accent">
            {selectedRound} 라운드 {completedRounds.has(selectedRound) && "🔒"}
          </h4>
        </div>
        <button
          className="btn btn-light rounded-circle shadow-sm d-flex align-items-center justify-content-center"
          style={{ width: "45px", height: "45px", fontWeight: "900", fontSize: "1.2rem" }}
          onClick={() => setSelectedRound((r) => Math.min(10, r + 1))}
          disabled={selectedRound === 10}
        >
          {">"}
        </button>
      </div>

      <div className="row g-2 px-2">
        {allPlayersWithScores.map((p) => {
          const score = activeGame.scores.find((s) => s.round === selectedRound && s.user_id === p.id);
          const inputs = roundInputs[p.id] || { bid: 0, actual: 0, bonus: 0 };
          return (
            <div key={p.id} className="col-6 col-md-4 col-lg-3">
              <div className="glass-card p-2 mb-2 border-0 shadow-sm position-relative overflow-hidden h-100" style={{ borderRadius: "20px" }}>
                <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                  <div className="d-flex flex-column align-items-center justify-content-center w-50">
                    <div className="d-flex align-items-center justify-content-center gap-1 mb-1">
                      <RankBadge total={p.total} sortedTotals={sortedTotals} />
                      <span className="fw-bold text-truncate" style={{ color: "var(--text-main)", maxWidth: "65px", fontSize: "0.95rem" }}>{p.name}</span>
                    </div>
                    <div className="fw-900" style={{ color: getRankColor(p.total, sortedTotals), fontSize: "1.05rem" }}>{p.total} pts</div>
                  </div>

                  <div className="d-flex flex-column align-items-center w-50">
                    <div className="small text-muted mb-1 fw-bold" style={{ fontSize: "0.7rem" }}>예측(Bid)</div>
                    <CompactStepper
                      id={`bid-${selectedRound}-${p.id}`}
                      initialValue={inputs.bid}
                      min={0}
                      max={10}
                      onChange={(val) => updateInput(p.id, "bid", val)}
                    />
                  </div>
                </div>

                <div className="d-flex gap-1 pt-1 text-center">
                  <div className="w-50">
                    <div className="small text-muted mb-1 fw-bold" style={{ fontSize: "0.7rem" }}>보너스</div>
                    <CompactStepper
                      id={`bonus-${selectedRound}-${p.id}`}
                      initialValue={inputs.bonus}
                      min={0}
                      max={150}
                      step={10}
                      isBonus={true}
                      onChange={(val) => updateInput(p.id, "bonus", val)}
                    />
                  </div>
                  <div className="w-50">
                    <div className="small text-muted mb-1 fw-bold" style={{ fontSize: "0.7rem" }}>실제(Actual)</div>
                    <CompactStepper
                      id={`actual-${selectedRound}-${p.id}`}
                      initialValue={Number(inputs.actual)}
                      min={0}
                      max={10}
                      onChange={(val) => updateInput(p.id, "actual", val)}
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

      <SkullKingModal
        show={!!modalConfig}
        message={modalConfig?.message || ""}
        title={modalConfig?.title}
        onConfirm={() => {
          if (modalConfig?.onConfirm) modalConfig.onConfirm();
          setModalConfig(null);
        }}
        onCancel={modalConfig?.onConfirm ? () => setModalConfig(null) : undefined}
      />


    </div>
  );
}
