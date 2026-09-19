export const TIERS = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'elite'] as const;
export type TierId = (typeof TIERS)[number];

export function tierFromRank(rank: number): TierId {
  if (rank <= 1) return 'elite';
  if (rank <= 3) return 'diamond';
  if (rank <= 10) return 'platinum';
  if (rank <= 25) return 'gold';
  if (rank <= 50) return 'silver';
  return 'bronze';
}

export function tierFromWins(wins: number): TierId {
  if (wins >= 50) return 'elite';
  if (wins >= 20) return 'diamond';
  if (wins >= 8) return 'platinum';
  if (wins >= 3) return 'gold';
  if (wins >= 1) return 'silver';
  return 'bronze';
}
