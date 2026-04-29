import React from "react";
import { getRankColor, getRankBadgeLabel } from "../../utils/skullKingUtils";

interface RankBadgeProps {
  total: number;
  sortedTotals: number[];
}

const RankBadge: React.FC<RankBadgeProps> = ({ total, sortedTotals }) => {
  const rank = sortedTotals.indexOf(total) + 1;
  const color = getRankColor(total, sortedTotals);

  return (
    <span
      className="rank-badge"
      style={{
        backgroundColor: color,
      }}
    >
      {getRankBadgeLabel(rank)}
    </span>
  );
};

export default RankBadge;
