import React from "react";

interface RoundQuickSelectorProps {
  currentRound: number;
  completedRounds: Set<number>;
  onSelect: (round: number) => void;
}

const RoundQuickSelector: React.FC<RoundQuickSelectorProps> = ({
  currentRound,
  completedRounds,
  onSelect,
}) => {
  return (
    <div className="d-flex justify-content-center gap-1 mb-4 px-2">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((r) => {
        const isCompleted = completedRounds.has(r);
        const isSelected = currentRound === r;
        return (
          <div
            key={r}
            onClick={() => onSelect(r)}
            className="d-flex align-items-center justify-content-center rounded-circle"
            style={{
              width: "30px",
              height: "30px",
              fontSize: "0.75rem",
              cursor: "pointer",
              fontWeight: isSelected ? "800" : "500",
              backgroundColor: isSelected
                ? "var(--accent-color)"
                : isCompleted
                ? "#e1f5fe"
                : "#f8f9fa",
              color: isSelected
                ? "white"
                : isCompleted
                ? "#0288d1"
                : "#adb5bd",
              border: isSelected
                ? "none"
                : isCompleted
                ? "1px solid #b3e5fc"
                : "1px solid #dee2e6",
              transition: "all 0.2s ease",
            }}
          >
            {r}
          </div>
        );
      })}
    </div>
  );
};

export default RoundQuickSelector;
