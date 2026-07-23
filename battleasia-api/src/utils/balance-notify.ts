import { emitBalanceUpdated, emitUserStatsUpdated } from './socket.js';

export async function notifyBalanceChange(
  userId: string,
  balanceAfter: number,
  balanceBefore: number
) {
  const added = balanceAfter - balanceBefore;
  emitBalanceUpdated(userId, balanceAfter, added, balanceBefore);
  emitUserStatsUpdated(userId, balanceAfter);
}
