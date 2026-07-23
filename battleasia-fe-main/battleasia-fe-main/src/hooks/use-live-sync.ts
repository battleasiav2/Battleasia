import { useEffect } from 'react';

import { liveSyncBus, type LiveSyncTopic } from 'src/lib/live-sync-bus';

// ----------------------------------------------------------------------

const DEFAULT_USER_TOPICS: LiveSyncTopic[] = [
  'balance',
  'wallet',
  'referral',
  'notifications',
  'matches',
  'orders',
  'profile',
];

export const LIVE_SYNC_TOPICS = {
  wallet: ['balance', 'wallet'],
  referral: ['referral', 'balance'],
  matches: ['matches', 'balance'],
  orders: ['orders', 'balance', 'wallet'],
  dashboard: ['dashboard', 'matches'],
  profile: ['profile', 'balance', 'matches'],
  notifications: ['notifications'],
} as const satisfies Record<string, readonly LiveSyncTopic[]>;

/** Re-run `onSync` when live socket events fire (no manual refresh). */
export function useLiveSync(
  onSync: () => void,
  topics: readonly LiveSyncTopic[] = DEFAULT_USER_TOPICS
) {
  const topicsKey = topics.join('|');

  useEffect(() => {
    const uniqueTopics = [...new Set(topics)] as LiveSyncTopic[];
    const unsubscribers = uniqueTopics.map((topic) => liveSyncBus.on(topic, onSync));
    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onSync, topicsKey]);
}
