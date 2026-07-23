import { env } from '../config/env.js';

export function logAuthCode(label: string, email: string, code: string) {
  if (env.isProduction || !env.logAuthCodes) return;
  console.log(`[auth] ${label} for ${email}: ${code}`);
}
