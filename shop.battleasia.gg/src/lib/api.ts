export type ApiError = {
  status: number;
  message: string;
  fields?: Record<string, string>;
  retryAfter?: number;
};

export type ApiInit = RequestInit & { idempotencyKey?: string; skipRefresh?: boolean };

const GATE = 'ba_shop_gate';
const USER = 'ba-shop-user';
const REFRESH = 'ba-shop-refresh';
const ACCESS = 'ba-shop-access';

let refreshInflight: Promise<boolean> | null = null;

function readRefresh() {
  try {
    return sessionStorage.getItem(REFRESH) || '';
  } catch {
    return '';
  }
}

function writeRefresh(token: string) {
  try {
    if (token) sessionStorage.setItem(REFRESH, token);
    else sessionStorage.removeItem(REFRESH);
  } catch {
    /* ignore */
  }
}

function readAccess() {
  try {
    return sessionStorage.getItem(ACCESS) || '';
  } catch {
    return '';
  }
}

function writeAccess(token: string) {
  try {
    if (token) sessionStorage.setItem(ACCESS, token);
    else sessionStorage.removeItem(ACCESS);
  } catch {
    /* ignore */
  }
}

function clearShopOnly() {
  try {
    sessionStorage.removeItem(GATE);
    sessionStorage.removeItem(USER);
    sessionStorage.removeItem(REFRESH);
    sessionStorage.removeItem(ACCESS);
  } catch {
    /* ignore */
  }
}

function kickToShopSignIn() {
  clearShopOnly();
  const path = window.location.pathname + window.location.search;
  if (path.startsWith('/user')) {
    window.location.assign(`/auth/sign-in?returnTo=${encodeURIComponent(path)}`);
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
  if (access) writeAccess(access);
  if (refresh) writeRefresh(refresh);
  return Boolean(access || refresh);
}

async function silentRefresh() {
  if (refreshInflight) return refreshInflight;
  refreshInflight = (async () => {
    try {
      const refresh = readRefresh();
      const res = await fetch('/api/v2/users/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
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
  if (rest.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (idempotencyKey) headers.set('Idempotency-Key', idempotencyKey);
  const access = readAccess();
  if (access && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${access}`);
  if (!headers.has('Accept-Language')) {
    try {
      const lang = localStorage.getItem('ba-lang') || document.documentElement.lang || 'en';
      if (lang) headers.set('Accept-Language', lang);
    } catch {
      /* ignore */
    }
  }
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
    kickToShopSignIn();
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
  if (data && typeof data === 'object' && 'results' in data) {
    const results = (data as { results?: T[] }).results;
    return Array.isArray(results) ? results : [];
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

export function rememberShopRefresh(payload: unknown) {
  captureRefreshPayload(payload);
}
