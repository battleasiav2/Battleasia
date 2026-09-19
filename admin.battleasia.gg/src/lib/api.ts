export type ApiError = {
  status: number;
  message: string;
  fields?: Record<string, string>;
  retryAfter?: number;
};

export type ApiInit = RequestInit & { idempotencyKey?: string; skipRefresh?: boolean };

const TOKEN = 'ba-admin-token';
const REFRESH = 'ba-admin-refresh';
const GATE = 'ba-admin-gate';
const USER = 'ba-admin-user';

let refreshInflight: Promise<boolean> | null = null;

export function readAdminToken() {
  return sessionStorage.getItem(TOKEN) || '';
}

export function writeAdminToken(token: string) {
  if (token) sessionStorage.setItem(TOKEN, token);
  else sessionStorage.removeItem(TOKEN);
}

export function readAdminRefresh() {
  return sessionStorage.getItem(REFRESH) || '';
}

export function writeAdminRefresh(token: string) {
  if (token) sessionStorage.setItem(REFRESH, token);
  else sessionStorage.removeItem(REFRESH);
}

function clearAdminLocal() {
  sessionStorage.removeItem(GATE);
  sessionStorage.removeItem(USER);
  writeAdminToken('');
  writeAdminRefresh('');
}

function kickToAdminLogin() {
  clearAdminLocal();
  const path = window.location.pathname + window.location.search;
  if (!path.startsWith('/auth/')) {
    window.location.assign(`/auth/login?returnTo=${encodeURIComponent(path)}`);
  }
}

function captureRefreshPayload(payload: unknown) {
  if (!payload || typeof payload !== 'object') return false;
  const row = payload as {
    token?: string;
    refreshToken?: string;
    data?: { token?: string };
    session?: { accessToken?: string; refreshToken?: string };
  };
  const access = row.token || row.data?.token || row.session?.accessToken || '';
  const refresh = row.refreshToken || row.session?.refreshToken || '';
  if (access) writeAdminToken(access);
  if (refresh) writeAdminRefresh(refresh);
  return Boolean(access);
}

async function silentRefresh() {
  if (refreshInflight) return refreshInflight;
  refreshInflight = (async () => {
    try {
      const headers = new Headers({ 'Content-Type': 'application/json' });
      const access = readAdminToken();
      if (access) headers.set('Authorization', `Bearer ${access}`);
      const refresh = readAdminRefresh();
      const res = await fetch('/api/v3/users/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify(refresh ? { refresh } : {}),
      });
      if (!res.ok) return false;
      const data = await res.json().catch(() => null);
      return captureRefreshPayload(data);
    } catch {
      return false;
    } finally {
      refreshInflight = null;
    }
  })();
  return refreshInflight;
}

function shouldRetryGet(method: string, path: string) {
  return method.toUpperCase() === 'GET' && !path.includes('/refresh');
}

export async function api<T>(path: string, init: ApiInit = {}): Promise<T> {
  const { idempotencyKey, skipRefresh, ...rest } = init;
  const headers = new Headers(rest.headers);
  if (rest.body && !headers.has('Content-Type') && !(rest.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (idempotencyKey) headers.set('Idempotency-Key', idempotencyKey);
  const token = readAdminToken();
  if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(path, {
    ...rest,
    headers,
    credentials: 'include',
  });
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }
  if (res.status === 401 && !skipRefresh && shouldRetryGet(rest.method || 'GET', path)) {
    const ok = await silentRefresh();
    if (ok) return api<T>(path, { ...init, skipRefresh: true });
    kickToAdminLogin();
  }
  if (!res.ok) {
    const payload = (data ?? {}) as { message?: string; errors?: Record<string, string> };
    const err: ApiError = {
      status: res.status,
      message:
        payload.message ||
        (res.status === 429
          ? 'Too many requests. Wait and retry.'
          : res.status === 413
            ? 'File is too large.'
            : res.status >= 500
              ? 'Server is busy. Retry in a moment.'
              : 'Request failed'),
      fields: payload.errors,
      retryAfter: Number(res.headers.get('Retry-After')) || undefined,
    };
    throw err;
  }
  return data as T;
}

export function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

export function unwrapList<T>(payload: unknown): T[] {
  const data = unwrapData<unknown>(payload);
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object') {
    const rec = data as { results?: T[]; users?: T[]; notifications?: T[] };
    if (Array.isArray(rec.results)) return rec.results;
    if (Array.isArray(rec.users)) return rec.users;
  }
  return [];
}

export function unwrapUser<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'user' in payload) {
    const user = (payload as { user: T }).user;
    if (user) return user;
  }
  return unwrapData<T>(payload);
}

export function isApiError(err: unknown): err is ApiError {
  return Boolean(err && typeof err === 'object' && 'status' in err && 'message' in err);
}

export function newIdempotencyKey() {
  return crypto.randomUUID();
}
