import { useRef, useEffect, useCallback } from 'react';

import { useDispatch, useSelector } from 'src/store';
import {
  setError,
  setLoading,
  markAsRead,
  markAllAsRead,
  addNotification,
  setNotifications,
  clearNotifications,
} from 'src/store/reducers/notifications';

import { liveSyncBus } from 'src/lib/live-sync-bus';
import { socketService } from 'src/lib/socket';
import useApi from './use-api';

import type { Notification } from 'src/store/types/notifications';

// ----------------------------------------------------------------------

const POLLING_INTERVAL = 30000; // 30 seconds

// ----------------------------------------------------------------------

export function useNotificationsPolling() {
  const dispatch = useDispatch();
  const api = useApi();
  const { isLoggedIn } = useSelector((state) => state.auth);
  const notificationsState = useSelector((state) => state.notifications);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousNotificationsRef = useRef<Notification[]>([]);

  // Fetch notifications from API
  const fetchNotifications = useCallback(
    async (isInitial = false) => {
      if (!isLoggedIn) return;

      try {
        if (isInitial) {
          dispatch(setLoading(true));
        }

        const response = await api.getNotificationsApi();
        const payload = response?.data?.data;

        if (payload) {
          const items = Array.isArray(payload?.results) ? payload?.results : [];

          const newNotifications: Notification[] = items.map((item: any) => ({
            id: item?.id,
            type: item?.type || 'general',
            title: item?.title || item?.subject || '',
            subject: item?.subject,
            category: item?.category || 'General',
            isUnRead: Boolean(item?.isUnRead),
            avatarUrl: item?.avatarUrl || null,
            createdAt: item?.createdAt || null,
          }));

          // Detect new notifications (compare with previous)
          if (!isInitial && previousNotificationsRef.current.length > 0) {
            const previousIds = new Set(previousNotificationsRef.current.map((n) => n.id));
            const addedNotifications = newNotifications.filter((n) => !previousIds.has(n.id));

            // Dispatch individual add actions for new notifications
            addedNotifications.forEach((notification) => {
              dispatch(addNotification(notification));
            });

            // Update the full list if there are changes
            if (addedNotifications.length > 0 || newNotifications.length !== previousNotificationsRef.current.length) {
              dispatch(setNotifications(newNotifications));
            }
          } else {
            // Initial load or first fetch
            dispatch(setNotifications(newNotifications));
          }

          previousNotificationsRef.current = newNotifications;
        } else {
          dispatch(setError('Failed to fetch notifications'));
        }
      } catch (error: any) {
        console.error('Polling error:', error);
        if (isInitial) {
          dispatch(setError(error?.message || 'Failed to fetch notifications'));
        }
      }
    },
    [api, dispatch, isLoggedIn]
  );

  // Mark notification as read
  const markNotificationAsRead = useCallback(
    async (id: string) => {
      try {
        await api.markNotificationReadApi(id);
        dispatch(markAsRead(id));
      } catch (error: any) {
        console.error('Failed to mark notification as read:', error);
      }
    },
    [api, dispatch]
  );

  // Mark all notifications as read
  const markAllNotificationsAsRead = useCallback(async () => {
    try {
      await api.markAllNotificationsReadApi();
      dispatch(markAllAsRead());
    } catch (error: any) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, [api, dispatch]);

  // Clear notifications on logout
  useEffect(() => {
    if (!isLoggedIn) {
      dispatch(clearNotifications());
      previousNotificationsRef.current = [];
    }
  }, [isLoggedIn, dispatch]);

  // Setup polling
  useEffect(() => {
    if (!isLoggedIn) {
      // Clear interval on logout
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return undefined;
    }

    // Initial fetch
    fetchNotifications(true);

    // Setup polling interval
    intervalRef.current = setInterval(() => {
      fetchNotifications(false);
    }, POLLING_INTERVAL);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isLoggedIn, fetchNotifications]);

  // Fetch on window focus (optional - better UX)
  useEffect(() => {
    if (!isLoggedIn) return undefined;

    const handleFocus = () => {
      fetchNotifications(false);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isLoggedIn, fetchNotifications]);

  // Real-time: socket pushes new items; bus triggers full list refresh
  useEffect(() => {
    if (!isLoggedIn) return undefined;

    const handleNewNotification = (data: any) => {
      const notification: Notification = {
        id: data?.id || data?._id || '',
        type: data?.type || 'general',
        title: data?.title || data?.subject || '',
        subject: data?.subject,
        category: data?.category || 'General',
        isUnRead: true,
        avatarUrl: data?.avatarUrl || null,
        createdAt: data?.createdAt || new Date().toISOString(),
      };
      dispatch(addNotification(notification));
    };

    const handleNotificationsSync = () => {
      fetchNotifications(false);
    };

    socketService.onNewNotification(handleNewNotification);
    const unsubBus = liveSyncBus.on('notifications', handleNotificationsSync);

    return () => {
      socketService.offNewNotification(handleNewNotification);
      unsubBus();
    };
  }, [isLoggedIn, dispatch, fetchNotifications]);

  return {
    ...notificationsState,
    fetchNotifications: () => fetchNotifications(false),
    markNotificationAsRead,
    markAllNotificationsAsRead,
  };
}
