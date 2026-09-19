import { api } from './api';

export async function registerPushToken(platform: 'web' | 'android' = 'web') {
  try {
    const existing = sessionStorage.getItem('ba-push-token');
    let token = existing || '';
    if (!token && 'Notification' in window) {
      const perm = await Notification.requestPermission().catch(() => 'denied');
      if (perm !== 'granted') return;
      token = `web:${crypto.randomUUID()}`;
      sessionStorage.setItem('ba-push-token', token);
    }
    if (!token) return;
    await api('/api/v2/users/me/push-token', {
      method: 'POST',
      body: JSON.stringify({ token, platform }),
    });
  } catch {
    /* FCM unset = fail open */
  }
}
