import { useEffect, useRef, useState } from "react";
import { LadderGame, LadderData } from "../../types/ladder";

interface LadderCanvasProps {
  game: LadderGame;
}

const COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b",
  "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16",
];

const PADDING_X = 60;
const PADDING_TOP = 64;
const PADDING_BOTTOM = 64;
const CELL_WIDTH = 100;
const ROW_HEIGHT = 40;
const TOTAL_DURATION_MS_PER_ROW = 150;

function tracePath(ladderData: LadderData, startPosition: number, upToRow: number): number {
  let pos = startPosition;
  const limit = Math.min(upToRow, ladderData.rows);
  for (let row = 0; row < limit; row++) {
    if (pos > 0 && ladderData.rungs[row][pos - 1]) {
      pos--;
    } else if (pos < ladderData.columns - 1 && ladderData.rungs[row][pos]) {
      pos++;
    }
  }
  return pos;
}

export default function LadderCanvas({ game }: LadderCanvasProps) {
  const rafRef = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);

  const ladderData: LadderData = JSON.parse(game.ladder_data);
  const totalDuration = ladderData.rows * TOTAL_DURATION_MS_PER_ROW;

  const svgWidth = PADDING_X * 2 + (ladderData.columns - 1) * CELL_WIDTH;
  const svgHeight = PADDING_TOP + PADDING_BOTTOM + ladderData.rows * ROW_HEIGHT;

  // 참여자/결과를 position 오름차순으로 정렬
  const participants = [...game.participants].sort((a, b) => a.position - b.position);
  const results = [...game.results].sort((a, b) => a.position - b.position);

  useEffect(() => {
    const tick = () => {
      const elapsed = Date.now() - new Date(game.started_at!).getTime();
      const p = Math.min(elapsed / totalDuration, 1.0);
      setProgress(p);
      if (p < 1.0) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [game.started_at, totalDuration]);

  const colX = (pos: number) => PADDING_X + pos * CELL_WIDTH;
  const rowY = (row: number) => PADDING_TOP + row * ROW_HEIGHT;

  const isDone = progress >= 1.0;

  return (
    <div className="d-flex flex-column align-items-center">
      <div style={{ overflowX: "auto", width: "100%" }}>
        <svg
          width={svgWidth}
          height={svgHeight}
          style={{ display: "block", margin: "0 auto" }}
        >
          {/* 세로줄 */}
          {Array.from({ length: ladderData.columns }, (_, i) => (
            <line
              key={`vline-${i}`}
              x1={colX(i)} y1={PADDING_TOP}
              x2={colX(i)} y2={PADDING_TOP + ladderData.rows * ROW_HEIGHT}
              stroke="#94a3b8" strokeWidth={2}
            />
          ))}

          {/* 가로줄(rungs) */}
          {ladderData.rungs.map((row, rIdx) =>
            row.map((hasRung, cIdx) =>
              hasRung ? (
                <line
                  key={`rung-${rIdx}-${cIdx}`}
                  x1={colX(cIdx)} y1={rowY(rIdx) + ROW_HEIGHT / 2}
                  x2={colX(cIdx + 1)} y2={rowY(rIdx) + ROW_HEIGHT / 2}
                  stroke="#94a3b8" strokeWidth={2}
                />
              ) : null
            )
          )}

          {/* 참여자 이름 (상단) */}
          {participants.map((p, idx) => (
            <text
              key={`pname-${p.id}`}
              x={colX(p.position)}
              y={PADDING_TOP - 12}
              textAnchor="middle"
              fontSize={13}
              fontWeight="bold"
              fill={COLORS[idx % COLORS.length]}
            >
              {p.user.name}
            </text>
          ))}

          {/* 결과 라벨 (하단) */}
          {results.map((r) => {
            const highlighted = isDone && r.winner_user_id !== null;
            return (
              <text
                key={`rlabel-${r.id}`}
                x={colX(r.position)}
                y={PADDING_TOP + ladderData.rows * ROW_HEIGHT + 28}
                textAnchor="middle"
                fontSize={13}
                fontWeight={highlighted ? "bold" : "normal"}
                fill={highlighted ? "#ef4444" : "#475569"}
              >
                {r.label}
              </text>
            );
          })}

          {/* 애니메이션 dot */}
          {participants.map((p, idx) => {
            const currentRow = progress * ladderData.rows;
            const floorRow = Math.floor(currentRow);
            const currentCol = tracePath(ladderData, p.position, floorRow);

            // 소수점 부분으로 행 사이 y 보간
            const nextCol = tracePath(ladderData, p.position, floorRow + 1);
            const frac = currentRow - floorRow;
            const interpX = colX(currentCol) + (colX(nextCol) - colX(currentCol)) * frac;
            const interpY = rowY(currentRow);

            return (
              <circle
                key={`dot-${p.id}`}
                cx={interpX}
                cy={interpY}
                r={8}
                fill={COLORS[idx % COLORS.length]}
                stroke="white"
                strokeWidth={2}
              />
            );
          })}
        </svg>
      </div>

      {/* 결과 요약 (애니메이션 완료 후) */}
      {isDone && (
        <div className="mt-4 w-100" style={{ maxWidth: 480 }}>
          <h5 className="fw-bold text-center mb-3">결과</h5>
          <ul className="list-group">
            {participants.map((p, idx) => {
              const finalCol = tracePath(ladderData, p.position, ladderData.rows);
              const result = results.find((r) => r.position === finalCol);
              return (
                <li
                  key={p.id}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <span style={{ color: COLORS[idx % COLORS.length], fontWeight: "bold" }}>
                    {p.user.name}
                  </span>
                  <span className="badge rounded-pill" style={{ backgroundColor: COLORS[idx % COLORS.length] }}>
                    {result?.label ?? "?"}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
