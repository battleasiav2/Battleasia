export type LiveSyncTopic =
  | 'balance'
  | 'wallet'
  | 'referral'
  | 'notifications'
  | 'matches'
  | 'orders'
  | 'profile'
  | 'dashboard'
  | 'all';

type LiveSyncListener = (payload?: unknown) => void;

class LiveSyncBus {
  private listeners = new Map<LiveSyncTopic, Set<LiveSyncListener>>();

  on(topic: LiveSyncTopic, listener: LiveSyncListener): () => void {
    if (!this.listeners.has(topic)) {
      this.listeners.set(topic, new Set());
    }
    this.listeners.get(topic)!.add(listener);
    return () => {
      this.listeners.get(topic)?.delete(listener);
    };
  }

  emit(topic: LiveSyncTopic, payload?: unknown) {
    this.listeners.get(topic)?.forEach((listener) => {
      try {
        listener(payload);
      } catch (error) {
        console.error(`[LiveSyncBus] listener error (${topic}):`, error);
      }
    });

    if (topic !== 'all') {
      this.listeners.get('all')?.forEach((listener) => {
        try {
          listener({ topic, payload });
        } catch (error) {
          console.error('[LiveSyncBus] listener error (all):', error);
        }
      });
    }
  }
}

export const liveSyncBus = new LiveSyncBus();
