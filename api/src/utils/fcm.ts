import { DevicePushToken } from '../models/DevicePushToken.js';
import { User } from '../models/User.js';

function looksLikeFcmToken(token: string) {
  if (!token || token.length < 32) return false;
  if (token.startsWith('web:') || token.startsWith('android:')) return false;
  return true;
}

async function tokensForUsers(userIds: string[]) {
  const [users, rows] = await Promise.all([
    User.find({ _id: { $in: userIds } }).select('fcm'),
    DevicePushToken.find({ userId: { $in: userIds } }).select('token'),
  ]);
  const fromUser = users.flatMap((u) => [u.fcm?.android, u.fcm?.web]);
  const fromRows = rows.map((r) => r.token);
  return [...new Set([...fromUser, ...fromRows].filter((t): t is string => typeof t === 'string' && looksLikeFcmToken(t)))];
}

async function postLegacy(tokens: string[], title: string, body: string, data: Record<string, string>) {
  const key = process.env.FCM_SERVER_KEY || '';
  if (!key || !tokens.length) return;
  const res = await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      Authorization: `key=${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      registration_ids: tokens.slice(0, 500),
      notification: { title, body },
      data,
      priority: 'high',
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.warn('[fcm] send failed', res.status, text.slice(0, 200));
  }
}

export async function sendFcmToUser(
  userId: string,
  title: string,
  body: string,
  data: Record<string, string> = {}
) {
  try {
    if (!process.env.FCM_SERVER_KEY) return;
    await postLegacy(await tokensForUsers([userId]), title, body, data);
  } catch (error) {
    console.warn('[fcm] fail-open', error instanceof Error ? error.message : error);
  }
}

export async function sendFcmToUsers(
  userIds: string[],
  title: string,
  body: string,
  data: Record<string, string> = {}
) {
  try {
    if (!process.env.FCM_SERVER_KEY || !userIds.length) return;
    await postLegacy(await tokensForUsers(userIds), title, body, data);
  } catch (error) {
    console.warn('[fcm] fail-open', error instanceof Error ? error.message : error);
  }
}
