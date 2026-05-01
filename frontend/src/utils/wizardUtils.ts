import { WizardScore, WizardPlayerTotal } from "../types/wizard";

export function calculateWizardPoints(bid: number, actual: number): number {
  if (actual === -1 || actual === -2) return 0;
  if (bid === actual) return 20 + actual * 10;
  return -Math.abs(bid - actual) * 10;
}

export function calculateWizardPlayerTotals(
  scores: WizardScore[],
  completedRounds: Set<number>
): WizardPlayerTotal[] {
  const playerMap = new Map<number, { name: string; total: number }>();
  scores.forEach((s) => {
    if (!playerMap.has(s.user_id)) {
      playerMap.set(s.user_id, { name: s.user?.name || "Unknown", total: 0 });
    }
    if (completedRounds.has(s.round)) {
      playerMap.get(s.user_id)!.total += s.points || 0;
    }
  });
  return Array.from(playerMap.entries()).map(([id, v]) => ({ id, ...v }));
}

export function getWizardCompletedRounds(scores: WizardScore[]): Set<number> {
  const rounds = new Set<number>();
  const activeIds = new Set(
    scores.filter((s) => s.actual !== -2).map((s) => s.user_id)
  );
  const roundNums = new Set(scores.map((s) => s.round));
  roundNums.forEach((r) => {
    const roundScores = scores.filter(
      (s) => s.round === r && activeIds.has(s.user_id)
    );
    if (roundScores.length > 0 && roundScores.every((s) => s.actual !== -1)) {
      rounds.add(r);
    }
  });
  return rounds;
}

export function getWizardCurrentRound(
  scores: WizardScore[],
  totalRounds: number
): number {
  for (let r = 1; r <= totalRounds; r++) {
    const roundScores = scores.filter((s) => s.round === r);
    if (roundScores.some((s) => s.actual === -1)) {
      return r;
    }
  }
  return totalRounds;
}
