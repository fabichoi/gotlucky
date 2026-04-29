import { PlayerScore, PlayerTotal } from "../types/skullKing";

export const RAINBOW_COLORS = [
  "#ff4d4d", // Red
  "#ffa64d", // Orange
  "#ffdb4d", // Yellow
  "#4dff88", // Green
  "#4d94ff", // Blue
  "#804dff", // Indigo
  "#db4dff", // Violet
];

export const getRankColor = (total: number, sortedTotals: number[]) => {
  const rankIndex = sortedTotals.indexOf(total);
  return RAINBOW_COLORS[rankIndex] || "#6c757d";
};

export const getRankBadgeLabel = (rank: number) => {
  const ranks = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th"];
  return ranks[rank - 1] || `${rank}th`;
};

export const calculatePlayerTotals = (
  scores: PlayerScore[],
  completedRounds: Set<number>
): PlayerTotal[] => {
  const playerIds = Array.from(new Set(scores.map((s) => s.user_id)));
  return playerIds.map((id) => {
    const playerScores = scores.filter((s) => Number(s.user_id) === Number(id));
    const user = playerScores[0]?.user;
    const total = playerScores
      .filter((s) => completedRounds.has(s.round))
      .reduce((sum, s) => sum + (s.points || 0), 0);
    return { id: Number(id), name: user?.name || "Unknown", total };
  });
};

export const getCompletedRounds = (scores: PlayerScore[]): Set<number> => {
  const activeUserIds = new Set(
    scores.filter((s) => s.actual !== -1).map((s) => Number(s.user_id))
  );

  const completedRounds = new Set<number>();
  for (let r = 1; r <= 10; r++) {
    const roundScores = scores.filter((s) => s.round === r);
    const activeScoresInThisRound = roundScores.filter((s) =>
      activeUserIds.has(Number(s.user_id))
    );

    if (
      activeScoresInThisRound.length > 0 &&
      activeScoresInThisRound.every((s) => s.actual !== -1)
    ) {
      completedRounds.add(r);
    }
  }
  return completedRounds;
};

export const getCurrentRound = (scores: PlayerScore[]): number => {
  for (let r = 1; r <= 10; r++) {
    const roundScores = scores.filter((s) => s.round === r);
    if (roundScores.some((s) => s.actual === -1)) {
      return r;
    }
  }
  return 10;
};
