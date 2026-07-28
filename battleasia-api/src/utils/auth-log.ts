import { env } from '../config/env.js';

export function logAuthCode(label: string, email: string, code: string) {
  // Only when explicitly enabled (including production) — needed for admin OTP on Webuzo.
  if (!env.logAuthCodes) return;
  console.log(`[auth] ${label} for ${email}: ${code}`);
}
