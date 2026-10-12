import { env } from '../config/env.js';

/** Records that a code was requested. The code argument is ignored and never written to logs. */
export function logAuthCode(label: string, email: string, _code?: string) {
  if (!env.logAuthCodes) return;
  console.log(`[auth] ${label} requested for ${email}`);
}
