function parseDsn(dsn: string) {
  try {
    const url = new URL(dsn);
    const key = url.username;
    const project = url.pathname.replace(/^\//, '');
    if (!key || !project) return null;
    return {
      store: `${url.protocol}//${url.host}/api/${project}/store/?sentry_key=${key}`,
    };
  } catch {
    return null;
  }
}

export function captureApiException(error: unknown, extra: Record<string, string> = {}) {
  const dsn = process.env.SENTRY_DSN || '';
  const parsed = dsn ? parseDsn(dsn) : null;
  if (!parsed) return;
  const err = error instanceof Error ? error : new Error(String(error));
  const payload = JSON.stringify({
    exception: { values: [{ type: err.name, value: err.message, stacktrace: { frames: [] } }] },
    extra,
    platform: 'node',
    timestamp: Date.now() / 1000,
  }).toLowerCase();
  if (payload.includes('password') || payload.includes('otp') || payload.includes('bearer') || payload.includes('jwt')) {
    return;
  }
  void fetch(parsed.store, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      exception: { values: [{ type: err.name, value: err.message }] },
      extra,
      platform: 'node',
    }),
  }).catch(() => undefined);
}

export function bootApiSentry() {
  process.on('uncaughtException', (error) => {
    captureApiException(error, { kind: 'uncaughtException' });
  });
  process.on('unhandledRejection', (reason) => {
    captureApiException(reason, { kind: 'unhandledRejection' });
  });
}
