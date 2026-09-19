import { getAppSettings } from '../models/AppSettings.js';
import { FraudHold } from '../models/FraudHold.js';
import { MatchParticipant } from '../models/MatchParticipant.js';
import { UserTransferHistory } from '../models/UserTransferHistory.js';
import { WithdrawalHistory } from '../models/WithdrawalHistory.js';
import { MoneyError } from './money.js';

export type VelocityKind = 'transfer' | 'withdraw' | 'join';

export type VelocitySettings = {
  enabled: boolean;
  windowMinutes: number;
  maxWithdrawals: number;
  maxTransfers: number;
  maxJoins: number;
};

export const DEFAULT_VELOCITY: VelocitySettings = {
  enabled: false,
  windowMinutes: 15,
  maxWithdrawals: 5,
  maxTransfers: 8,
  maxJoins: 30,
};

export function normalizeVelocitySettings(raw?: Partial<VelocitySettings> | null): VelocitySettings {
  return {
    enabled: raw?.enabled === true,
    windowMinutes: Math.min(Math.max(Number(raw?.windowMinutes) || DEFAULT_VELOCITY.windowMinutes, 1), 1440),
    maxWithdrawals: Math.min(Math.max(Number(raw?.maxWithdrawals) || DEFAULT_VELOCITY.maxWithdrawals, 1), 100),
    maxTransfers: Math.min(Math.max(Number(raw?.maxTransfers) || DEFAULT_VELOCITY.maxTransfers, 1), 100),
    maxJoins: Math.min(Math.max(Number(raw?.maxJoins) || DEFAULT_VELOCITY.maxJoins, 1), 200),
  };
}

export async function assertClearOfVelocity(userId: string, kind: VelocityKind) {
  const settings = await getAppSettings();
  const velocity = normalizeVelocitySettings(
    (settings as { velocitySettings?: Partial<VelocitySettings> }).velocitySettings,
  );
  if (!velocity.enabled) return;

  const open = await FraudHold.findOne({ userId, status: 'open' });
  if (open) throw new MoneyError('Under review', 403);

  const since = new Date(Date.now() - velocity.windowMinutes * 60 * 1000);
  let count = 0;
  let max = velocity.maxTransfers;
  if (kind === 'transfer') {
    count = await UserTransferHistory.countDocuments({ senderId: userId, createdAt: { $gte: since } });
    max = velocity.maxTransfers;
  } else if (kind === 'withdraw') {
    count = await WithdrawalHistory.countDocuments({ userId, createdAt: { $gte: since } });
    max = velocity.maxWithdrawals;
  } else {
    count = await MatchParticipant.countDocuments({ userId, createdAt: { $gte: since } });
    max = velocity.maxJoins;
  }

  if (count >= max) {
    await FraudHold.create({
      userId,
      kind,
      reason: `${kind} velocity ${count}/${max} in ${velocity.windowMinutes}m`,
      status: 'open',
    });
    throw new MoneyError('Under review', 403);
  }
}
