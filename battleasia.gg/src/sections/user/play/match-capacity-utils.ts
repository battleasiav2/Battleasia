/** Capacity helpers for admin-set totalPlayer vs live participantsCount. */

export type MatchCapacityInput = {
  participantsCount?: number;
  totalPlayer?: number;
};

export function getMatchCapacityState(match: MatchCapacityInput) {
  const joined = Math.max(0, match.participantsCount ?? 0);
  const max = Math.max(1, match.totalPlayer ?? 100);
  const percent = Math.min(100, (joined / max) * 100);
  const isFull = joined >= max;
  const spotsLeft = Math.max(0, max - joined);

  return { joined, max, percent, isFull, spotsLeft };
}

export function isMatchJoinableByCapacity(match: MatchCapacityInput) {
  return !getMatchCapacityState(match).isFull;
}
