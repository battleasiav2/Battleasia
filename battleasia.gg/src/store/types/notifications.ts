// ----------------------------------------------------------------------

export interface Notification {
  id: string;
  type: string;
  title: string;
  subject?: string;
  category: string;
  isUnRead: boolean;
  avatarUrl: string | null;
  createdAt: string | number | null;
}

export interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
}
