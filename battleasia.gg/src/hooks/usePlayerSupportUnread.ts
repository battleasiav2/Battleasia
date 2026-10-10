import { useCallback, useEffect, useState } from 'react';
import { isSignedIn } from '../lib/auth';
import { fetchPlayerSupportUnread, markSupportChatRead } from '../lib/social';
import { getAuthedSocket } from '../lib/socket';

export const SUPPORT_UNREAD_EVENT = 'ba-support-unread';

export function dispatchSupportUnread(count: number) {
  window.dispatchEvent(new CustomEvent(SUPPORT_UNREAD_EVENT, { detail: count }));
}

export function usePlayerSupportUnread(enabled = true) {
  const [count, setCount] = useState(0);

  const apply = useCallback((n: number) => {
    const safe = Math.max(0, Math.min(99, Math.floor(n)));
    setCount(safe);
    dispatchSupportUnread(safe);
  }, []);

  const refresh = useCallback(async () => {
    if (!enabled || !isSignedIn()) {
      apply(0);
      return;
    }
    try {
      apply(await fetchPlayerSupportUnread());
    } catch {
      /* keep last count */
    }
  }, [apply, enabled]);

  const markRead = useCallback(async () => {
    if (!isSignedIn()) {
      apply(0);
      return;
    }
    try {
      await markSupportChatRead();
    } catch {
      /* ignore */
    }
    apply(0);
  }, [apply]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!enabled || !isSignedIn()) return;
    const onVis = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [enabled, refresh]);

  useEffect(() => {
    if (!enabled || !isSignedIn()) return;
    let leave: (() => void) | undefined;
    getAuthedSocket().then((sock) => {
      if (!sock) return;
      const onUnread = (payload: { count?: number }) => {
        apply(Number(payload?.count) || 0);
      };
      sock.on('support-player-unread', onUnread);
      leave = () => sock.off('support-player-unread', onUnread);
    });
    return () => leave?.();
  }, [apply, enabled]);

  useEffect(() => {
    if (!enabled) return;
    const onBus = (e: Event) => {
      const detail = (e as CustomEvent<number>).detail;
      if (typeof detail === 'number') setCount(Math.max(0, Math.min(99, detail)));
    };
    window.addEventListener(SUPPORT_UNREAD_EVENT, onBus);
    return () => window.removeEventListener(SUPPORT_UNREAD_EVENT, onBus);
  }, [enabled]);

  return { count, refresh, markRead };
}
