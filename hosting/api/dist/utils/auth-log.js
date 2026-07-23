import { env } from '../config/env.js';
export function logAuthCode(label, email, code) {
    if (env.isProduction || !env.logAuthCodes)
        return;
    console.log(`[auth] ${label} for ${email}: ${code}`);
}
