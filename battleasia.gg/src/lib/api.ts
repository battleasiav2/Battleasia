export type ApiError = {
  status: number;
  message: string;
  fields?: Record<string, string>;
  retryAfter?: number;
};

export type ApiInit = RequestInit & { idempotencyKey?: string; skipRefresh?: boolean };

const ACCESS = 'ba-token';
const REFRESH = 'ba-refresh';
const FLAG = 'ba-signed-in';
const USER = 'ba-user';

let refreshInflight: Promise<boolean> | null = null;

export function readAccessToken() {
  try {
    return sessionStorage.getItem(ACCESS) || '';
  } catch {
    return '';
  }
}

export function readRefreshToken() {
  try {
    return sessionStorage.getItem(REFRESH) || '';
  } catch {
    return '';
  }
}

export function writeAccessToken(token: string) {
  try {
    if (token) sessionStorage.setItem(ACCESS, token);
    else sessionStorage.removeItem(ACCESS);
  } catch {
    /* ignore */
  }
}

export function writeRefreshToken(token: string) {
  try {
    if (token) sessionStorage.setItem(REFRESH, token);
    else sessionStorage.removeItem(REFRESH);
  } catch {
    /* ignore */
  }
}

function clearLocalSession() {
  try {
    sessionStorage.removeItem(FLAG);
    sessionStorage.removeItem(USER);
    sessionStorage.removeItem(ACCESS);
    sessionStorage.removeItem(REFRESH);
  } catch {
    /* ignore */
  }
}

function kickToSignIn() {
  clearLocalSession();
  const path = window.location.pathname + window.location.search;
  if (path.startsWith('/user') || path.startsWith('/profile')) {
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
  if (access) writeAccessToken(access);
  if (refresh) writeRefreshToken(refresh);
  return Boolean(access);
}

async function silentRefresh() {
  if (refreshInflight) return refreshInflight;
  refreshInflight = (async () => {
    try {
      const headers = new Headers({ 'Content-Type': 'application/json' });
      const access = readAccessToken();
      if (access) headers.set('Authorization', `Bearer ${access}`);
      const refresh = readRefreshToken();
      const res = await fetch('/api/v2/users/refresh', {
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

function requestSignal(user?: AbortSignal | null) {
  const timeout = typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal ? AbortSignal.timeout(15000) : undefined;
  if (user && timeout && 'any' in AbortSignal) return AbortSignal.any([user, timeout]);
  return user || timeout;
}

function statusMessage(status: number) {
  if (status === 429) return 'Too many requests. Wait and retry.';
  if (status === 413) return 'File is too large.';
  if (status === 409) return 'Already submitted.';
  if (status === 403) return "You can't do that.";
  if (status === 404) return 'Not found.';
  if (status >= 500) return 'Server is busy. Retry in a moment.';
  return 'Request failed';
}

export async function api<T>(path: string, init: ApiInit = {}): Promise<T> {
  const { idempotencyKey, skipRefresh, ...rest } = init;
  const headers = new Headers(rest.headers);
  if (rest.body && !(rest.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (idempotencyKey) headers.set('Idempotency-Key', idempotencyKey);
  const access = readAccessToken();
  if (access && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${access}`);
  if (!headers.has('Accept-Language')) {
    try {
      const lang = localStorage.getItem('ba-lang') || document.documentElement.lang || 'en';
      if (lang) headers.set('Accept-Language', lang);
    } catch {
      /* ignore */
    }
  }
  let res: Response;
  try {
    res = await fetch(path, {
      ...rest,
      headers,
      credentials: 'include',
      signal: requestSignal(rest.signal),
    });
  } catch (err) {
    const timed = err instanceof DOMException && err.name === 'TimeoutError';
    throw {
      status: 0,
      message: timed ? 'Request timed out. Retry.' : 'Network error. Check your connection.',
    } satisfies ApiError;
  }
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
    kickToSignIn();
  }
  if (!res.ok) {
    const payload = (data ?? {}) as { message?: string; errors?: Record<string, string> };
    const err: ApiError = {
      status: res.status,
      message: payload.message || statusMessage(res.status),
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

export function uploadFile(
  path: string,
  file: File,
  opts: { onProgress?: (pct: number) => void; signal?: AbortSignal } = {},
) {
  return new Promise<unknown>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const form = new FormData();
    form.append('file', file);
    xhr.open('POST', path);
    xhr.withCredentials = true;
    const access = readAccessToken();
    if (access) xhr.setRequestHeader('Authorization', `Bearer ${access}`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) opts.onProgress?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      let data: unknown = null;
      try {
        data = JSON.parse(xhr.responseText || 'null');
      } catch {
        data = { message: xhr.responseText };
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data);
        return;
      }
      const payload = (data ?? {}) as { message?: string };
      reject({
        status: xhr.status,
        message: payload.message || statusMessage(xhr.status),
      } satisfies ApiError);
    };
    xhr.onerror = () => reject({ status: 0, message: 'Upload failed' } satisfies ApiError);
    xhr.onabort = () => reject({ status: 0, message: 'Upload canceled' } satisfies ApiError);
    const onAbort = () => xhr.abort();
    opts.signal?.addEventListener('abort', onAbort, { once: true });
    xhr.send(form);
  });
}
