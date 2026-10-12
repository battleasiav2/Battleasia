import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { VerificationCode } from '../models/VerificationCode.js';

export const OTP_MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 60_000;

export const codeAttemptLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: false,
  legacyHeaders: false,
  message: { status: false, message: 'Too many attempts. Try again later' },
});

export async function hashVerificationCode(code: string) {
  return bcrypt.hash(code, 8);
}

/** New codes are hashed. Codes already emailed in plaintext still match until they expire. */
export async function verificationCodeMatches(stored: string, given: string) {
  if (stored.startsWith('$2')) return bcrypt.compare(given, stored);
  return stored === given;
}

export async function storeVerificationCode(
  email: string,
  type: 'signup' | 'reset' | 'admin_login',
  code: string,
  expiresAt: Date,
) {
  const key = email.toLowerCase();
  await VerificationCode.deleteMany({ email: key, type });
  await VerificationCode.create({
    email: key,
    code: await hashVerificationCode(code),
    type,
    attempts: 0,
    expiresAt,
  });
}

export async function verificationOnCooldown(email: string, type: 'signup' | 'reset' | 'admin_login') {
  const row = await VerificationCode.findOne({ email: email.toLowerCase(), type }).select('createdAt');
  if (!row?.createdAt) return false;
  return Date.now() - new Date(row.createdAt).getTime() < RESEND_COOLDOWN_MS;
}

export async function checkVerificationCode(
  email: string,
  type: 'signup' | 'reset' | 'admin_login',
  code: string,
  consume: boolean,
) {
  const row = await VerificationCode.findOne({ email: email.toLowerCase(), type });
  if (!row) return { ok: false as const, reason: 'invalid' as const };
  if (row.expiresAt.getTime() < Date.now()) {
    await VerificationCode.deleteOne({ _id: row._id });
    return { ok: false as const, reason: 'invalid' as const };
  }
  if ((row.attempts || 0) >= OTP_MAX_ATTEMPTS) {
    await VerificationCode.deleteOne({ _id: row._id });
    return { ok: false as const, reason: 'limited' as const };
  }
  const match = await verificationCodeMatches(row.code, String(code || '').trim());
  if (!match) {
    const attempts = (row.attempts || 0) + 1;
    if (attempts >= OTP_MAX_ATTEMPTS) {
      await VerificationCode.deleteOne({ _id: row._id });
      return { ok: false as const, reason: 'limited' as const };
    }
    row.attempts = attempts;
    await row.save();
    return { ok: false as const, reason: 'invalid' as const };
  }
  if (consume) await VerificationCode.deleteOne({ _id: row._id });
  return { ok: true as const };
}
