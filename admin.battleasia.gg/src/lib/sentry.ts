type SentryMod = typeof import('@sentry/browser');

let sentry: SentryMod | null = null;

function dsn() {
  return (import.meta.env.VITE_SENTRY_DSN as string | undefined) || '';
}

export function bootSentry() {
  const key = dsn();
  if (!key || sentry) return;
  const start = () => {
    void import('@sentry/browser')
      .then((mod) => {
        sentry = mod;
        mod.init({
          dsn: key,
          sendDefaultPii: false,
          beforeSend(event) {
            const extra = JSON.stringify(event).toLowerCase();
            if (extra.includes('password') || extra.includes('otp') || extra.includes('bearer')) return null;
            return event;
          },
        });
      })
      .catch(() => undefined);
  };
  const idle = window.requestIdleCallback?.bind(window);
  if (idle) idle(start, { timeout: 4000 });
  else window.setTimeout(start, 4000);
}

export function captureException(err: unknown) {
  console.error(err);
  sentry?.captureException(err);
}
