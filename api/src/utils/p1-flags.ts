export type P1Flags = {
  igVictoryAutoPost: boolean;
  igHighlights: boolean;
  igGameFeed: boolean;
  igMessageRequests: boolean;
  igPinnedPosts: boolean;
  squadChat: boolean;
  kycBeforeWithdraw: boolean;
  cashbackDays: boolean;
  playerTip: boolean;
};

export const DEFAULT_P1_FLAGS: P1Flags = {
  igVictoryAutoPost: true,
  igHighlights: true,
  igGameFeed: true,
  igMessageRequests: true,
  igPinnedPosts: true,
  squadChat: true,
  kycBeforeWithdraw: true,
  cashbackDays: true,
  playerTip: true,
};

export function normalizeP1Flags(raw?: Partial<P1Flags> | null): P1Flags {
  return {
    igVictoryAutoPost: Boolean(raw?.igVictoryAutoPost),
    igHighlights: Boolean(raw?.igHighlights),
    igGameFeed: Boolean(raw?.igGameFeed),
    igMessageRequests: Boolean(raw?.igMessageRequests),
    igPinnedPosts: Boolean(raw?.igPinnedPosts),
    squadChat: Boolean(raw?.squadChat),
    kycBeforeWithdraw: Boolean(raw?.kycBeforeWithdraw),
    cashbackDays: Boolean(raw?.cashbackDays),
    playerTip: Boolean(raw?.playerTip),
  };
}
