import bcrypt from 'bcryptjs';
import { getAppSettings } from '../models/AppSettings.js';
import { User } from '../models/User.js';
import type { AuthedRequest } from '../middleware/auth.js';

export const DEFAULT_HIGH_VALUE_BAC = 1000; // prompt default, Admin Integrity can tune

export async function getHighValueThreshold() {
  const settings = await getAppSettings();
  const n = Number(settings.highValueWithdrawBac);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_HIGH_VALUE_BAC;
}

export class HighValueError extends Error {
  status = 403;
  constructor(message: string) {
    super(message);
    this.name = 'HighValueError';
  }
}

export async function assertHighValuePassword(req: AuthedRequest, amount: number) {
  const threshold = await getHighValueThreshold();
  if (!Number.isFinite(amount) || amount < threshold) return;
  const password = String(req.body?.password || req.body?.confirmPassword || '').trim();
  if (!password) {
    throw new HighValueError(`Password required for actions ≥ ${threshold} BAC`);
  }
  const admin = req.userId ? await User.findById(req.userId) : null;
  if (!admin) throw new HighValueError('Password confirmation failed');
  const ok = await bcrypt.compare(password, admin.password);
  if (!ok) throw new HighValueError('Password confirmation failed');
}
