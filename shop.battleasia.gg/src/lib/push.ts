import { api } from './api';

export async function registerPushToken(platform: 'web' | 'android' = 'web') {
  try {
    let token = sessionStorage.getItem('ba-push-token') || '';
    if (!token) {
      token = `web:${crypto.randomUUID()}`;
      sessionStorage.setItem('ba-push-token', token);
    }
    await api('/api/v2/users/me/push-token', {
      method: 'POST',
      body: JSON.stringify({ token, platform }),
    });
  } catch {
    /* fail open */
  }
}
