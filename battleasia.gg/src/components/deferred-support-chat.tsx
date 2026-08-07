import { lazy, Suspense, useEffect, useState } from 'react';

// ----------------------------------------------------------------------

const SupportChatLazy = lazy(() =>
  import('src/components/support-chat').then((m) => ({ default: m.SupportChat }))
);

function scheduleIdle(cb: () => void, timeoutMs = 4000) {
  if (typeof window === 'undefined') return () => {};

  const w = window as Window & {
    requestIdleCallback?: (fn: () => void, opts?: { timeout: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };

  if (typeof w.requestIdleCallback === 'function') {
    const id = w.requestIdleCallback(cb, { timeout: timeoutMs });
    return () => w.cancelIdleCallback?.(id);
  }

  const id = window.setTimeout(cb, Math.min(2000, timeoutMs));
  return () => window.clearTimeout(id);
}

/**
 * Support chat (socket + MUI) loads after idle — must not block LCP/TBT.
 */
export function DeferredSupportChat() {
  const [ready, setReady] = useState(false);

  useEffect(() => scheduleIdle(() => setReady(true), 4500), []);

  if (!ready) return null;

  return (
    <Suspense fallback={null}>
      <SupportChatLazy />
    </Suspense>
  );
}
