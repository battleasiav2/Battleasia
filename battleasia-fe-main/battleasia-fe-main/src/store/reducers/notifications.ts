import { createSlice } from '@reduxjs/toolkit';

import type { Notification, NotificationsState } from '../types/notifications';

// ----------------------------------------------------------------------

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  lastFetch: null,
};

// ----------------------------------------------------------------------

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Set loading state
    setLoading(state, action) {
      state.loading = action.payload;
    },

    // Set error
    setError(state, action) {
      state.error = action.payload;
      state.loading = false;
    },

    // Set all notifications (from API fetch)
    setNotifications(state, action) {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter((n: Notification) => n.isUnRead).length;
      state.lastFetch = Date.now();
      state.loading = false;
      state.error = null;
    },

    // Add new notification (from polling detection)
    addNotification(state, action) {
      // Prevent duplicates
      if (!state.notifications.some((n) => n.id === action.payload.id)) {
        state.notifications.unshift(action.payload);
        if (action.payload.isUnRead) {
          state.unreadCount += 1;
        }
      }
    },

    // Mark single notification as read
    markAsRead(state, action) {
      const notification = state.notifications.find((n) => n.id === action.payload);
      if (notification && notification.isUnRead) {
        notification.isUnRead = false;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    // Mark all as read
    markAllAsRead(state) {
      state.notifications = state.notifications.map((n) => ({ ...n, isUnRead: false }));
      state.unreadCount = 0;
    },

    // Clear all notifications (on logout)
    clearNotifications(state) {
      state.notifications = [];
      state.unreadCount = 0;
      state.error = null;
      state.loading = false;
      state.lastFetch = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setNotifications,
  addNotification,
  markAsRead,
  markAllAsRead,
  clearNotifications,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
