type PrizeInput = {
  entryFee?: number;
  totalPlayer?: number;
  prizeDescription?: string;
};

/** Estimate prize pool for display (entry × slots, or first number in description). */
export function estimateMatchWinningPool({ entryFee = 0, totalPlayer = 0, prizeDescription = '' }: PrizeInput) {
  if (entryFee > 0 && totalPlayer > 0) {
    return Math.round(entryFee * totalPlayer);
  }

  const match = prizeDescription.match(/(\d[\d,]*)/);
  if (match) {
    return Number(match[1].replace(/,/g, ''));
  }

  return 0;
}
