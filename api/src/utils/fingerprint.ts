import { createHash } from 'crypto';
import type { Request } from 'express';
import { DeviceFingerprint } from '../models/DeviceFingerprint.js';

export function getClientIp(req: {
  ip?: string;
  headers: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
}) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return req.ip || req.socket?.remoteAddress || '';
}

export async function recordFingerprint(req: Request, userId: string) {
  try {
    if (!userId) return;
    const ip = getClientIp(req).slice(0, 80);
    const ua = String(req.headers['user-agent'] || '').slice(0, 500);
    const body = (req.body || {}) as { deviceId?: string; fingerprint?: string };
    const device = String(body.deviceId || body.fingerprint || req.headers['x-device-id'] || '').slice(0, 200);
    const hash = createHash('sha256').update([ip, ua, device].join('|')).digest('hex');
    await DeviceFingerprint.findOneAndUpdate(
      { userId, hash },
      { $set: { ip, ua, lastSeen: new Date() }, $setOnInsert: { userId, hash } },
      { upsert: true },
    );
  } catch (error) {
    console.warn('[fingerprint] fail-open', error instanceof Error ? error.message : error);
  }
}
