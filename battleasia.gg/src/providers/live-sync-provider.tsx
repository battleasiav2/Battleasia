import { useEffect, type ReactNode } from 'react';

import { useDispatch, useSelector } from 'src/store';
import { balanceAction } from 'src/store/reducers/auth';
import { CONFIG } from 'src/global-config';
import { socketService } from 'src/lib/socket';
import { liveSyncBus } from 'src/lib/live-sync-bus';
import { useEngagementAlertsPolling } from 'src/hooks/use-engagement-alerts-polling';

// ----------------------------------------------------------------------

type LiveSyncProviderProps = {
  children: ReactNode;
};

export function LiveSyncProvider({ children }: LiveSyncProviderProps) {
  const dispatch = useDispatch();
  const { isLoggedIn, user } = useSelector((state) => state.auth);

  useEngagementAlertsPolling();

  useEffect(() => {
    if (!isLoggedIn || !user?._id) {
      socketService.disconnect();
      return undefined;
    }

    socketService.connect(CONFIG.serverUrl);

    const handleBalanceUpdated = (data: { balance?: number; added?: number; previousBalance?: number }) => {
      if (typeof data?.balance === 'number') {
        dispatch(balanceAction(data.balance));
      }
      liveSyncBus.emit('balance', data);
      liveSyncBus.emit('wallet', data);
      liveSyncBus.emit('referral', data);
      liveSyncBus.emit('profile', data);
      liveSyncBus.emit('orders', data);
    };

    const handleUserStatsUpdated = (data: { userId?: string; balance?: number }) => {
      if (data?.userId === user._id && typeof data.balance === 'number') {
        dispatch(balanceAction(data.balance));
      }
      liveSyncBus.emit('balance', data);
      liveSyncBus.emit('profile', data);
      liveSyncBus.emit('orders', data);
    };

    const handleNewNotification = (data: unknown) => {
      liveSyncBus.emit('notifications', data);
    };

    const handleMatchChange = (data: unknown) => {
      liveSyncBus.emit('matches', data);
      liveSyncBus.emit('orders', data);
    };

    const handleDashboardStats = (data: unknown) => {
      liveSyncBus.emit('dashboard', data);
    };

    socketService.onBalanceUpdated(handleBalanceUpdated);
    socketService.onUserStatsUpdated(handleUserStatsUpdated);
    socketService.onNewNotification(handleNewNotification);
    socketService.onMatchCreated(handleMatchChange);
    socketService.onMatchUpdated(handleMatchChange);
    socketService.onDashboardStatsUpdated(handleDashboardStats);

    return () => {
      socketService.offBalanceUpdated(handleBalanceUpdated);
      socketService.offUserStatsUpdated(handleUserStatsUpdated);
      socketService.offNewNotification(handleNewNotification);
      socketService.offMatchCreated(handleMatchChange);
      socketService.offMatchUpdated(handleMatchChange);
      socketService.offDashboardStatsUpdated(handleDashboardStats);
    };
  }, [dispatch, isLoggedIn, user?._id]);

  return children;
}
