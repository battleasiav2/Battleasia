import { useEffect, useRef, useCallback } from 'react';

import { useSelector } from 'src/store';
import useApi from './use-api';

const ALERTS_INTERVAL = 30 * 60 * 1000;

export function useEngagementAlertsPolling() {
  const api = useApi();
  const { isLoggedIn } = useSelector((state) => state.auth);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const scanAlerts = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      await api.getEngagementAlertsApi();
    } catch (error) {
      console.error('Engagement alerts scan failed:', error);
    }
  }, [api, isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return undefined;
    }

    scanAlerts();

    intervalRef.current = setInterval(scanAlerts, ALERTS_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isLoggedIn, scanAlerts]);
}
