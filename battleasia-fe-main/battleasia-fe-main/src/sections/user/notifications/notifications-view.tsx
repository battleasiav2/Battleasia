import { useMemo, useState, useCallback } from 'react';

import { Box, Stack } from '@mui/material';

import {
  UserPageShell,
  UserPageTitle,
  UserGlassCard,
  UserStatTile,
  UserEmptyState,
  UserActionButton,
} from 'src/layouts/user';

import { Iconify } from 'src/components/iconify';
import { PlayTabs } from 'src/components/play-tabs';
import { Scrollbar } from 'src/components/scrollbar';
import { UserAnimatedStat } from 'src/layouts/user';

import { useTranslate } from 'src/locales/use-locales';
import { useNotificationsPolling } from 'src/hooks/use-notifications-polling';

import type { NotificationTab } from './notifications-constants';
import {
  NotificationsHero,
  NotificationsPageSkeleton,
  NotificationItem,
} from './components';

import type { NotificationItemProps } from './components/notification-item';

// ----------------------------------------------------------------------

export function NotificationsView() {
  const { t } = useTranslate();
  const [currentTab, setCurrentTab] = useState<NotificationTab>('all');

  const {
    notifications: rawNotifications,
    unreadCount,
    loading,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useNotificationsPolling();

  const notifications: NotificationItemProps['notification'][] = rawNotifications.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    subject: n.subject,
    category: n.category,
    isUnRead: n.isUnRead,
    avatarUrl: n.avatarUrl,
    createdAt: n.createdAt,
  }));

  const archivedCount = Math.max(notifications.length - unreadCount, 0);

  const handleTabChange = useCallback((newValue: string) => {
    const allowedTabs: NotificationTab[] = ['all', 'unread', 'archived'];
    if (allowedTabs.includes(newValue as NotificationTab)) {
      setCurrentTab(newValue as NotificationTab);
    }
  }, []);

  const handleMarkAllAsRead = useCallback(async () => {
    if (!unreadCount) return;
    await markAllNotificationsAsRead();
  }, [markAllNotificationsAsRead, unreadCount]);

  const handleMarkNotification = useCallback(
    async (notificationId: string) => {
      await markNotificationAsRead(notificationId);
    },
    [markNotificationAsRead]
  );

  const filteredNotifications = notifications.filter((notification) => {
    if (currentTab === 'unread') return notification.isUnRead;
    if (currentTab === 'archived') return !notification.isUnRead;
    return true;
  });

  const showInitialSkeleton = loading && notifications.length === 0;

  return (
    <UserPageShell contentSx={{ maxWidth: 860, mx: 'auto' }}>
      <NotificationsHero title={t('notifications.title')} unreadCount={unreadCount} />

      <UserPageTitle
        badge={t('notifications.badgeInbox')}
        title={t('notifications.title')}
        subtitle={t('notifications.subtitle')}
        action={
          unreadCount > 0 ? (
            <UserActionButton
              actionVariant="ghost"
              size="small"
              onClick={handleMarkAllAsRead}
              startIcon={<Iconify icon="hugeicons:tick-double-02" />}
              sx={{ display: { xs: 'none', md: 'inline-flex' } }}
            >
              {t('notifications.markAllAsRead')}
            </UserActionButton>
          ) : undefined
        }
      />

      {unreadCount > 0 ? (
        <Stack sx={{ mb: 2, display: { xs: 'flex', md: 'none' } }}>
          <UserActionButton
            actionVariant="ghost"
            size="small"
            onClick={handleMarkAllAsRead}
            startIcon={<Iconify icon="hugeicons:tick-double-02" />}
            fullWidth
          >
            {t('notifications.markAllAsRead')}
          </UserActionButton>
        </Stack>
      ) : null}

      {showInitialSkeleton ? (
        <NotificationsPageSkeleton />
      ) : (
        <Stack spacing={3}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              gap: 1.5,
            }}
          >
            <UserStatTile
              label={t('notifications.all')}
              value={<UserAnimatedStat value={notifications.length} variant="h5" fontWeight={700} />}
              loading={loading}
            />
            <UserStatTile
              label={t('notifications.unread')}
              value={<UserAnimatedStat value={unreadCount} variant="h5" fontWeight={700} />}
              loading={loading}
            />
            <UserStatTile
              label={t('notifications.archived')}
              value={<UserAnimatedStat value={archivedCount} variant="h5" fontWeight={700} />}
              loading={loading}
            />
          </Box>

          <PlayTabs
            tabs={[
              { label: `${t('notifications.all')} (${notifications.length})`, value: 'all' },
              { label: `${t('notifications.unread')} (${unreadCount})`, value: 'unread' },
              { label: `${t('notifications.archived')} (${archivedCount})`, value: 'archived' },
            ]}
            activeTab={currentTab}
            onChange={handleTabChange}
          />

          <UserGlassCard sx={{ p: { xs: 1.5, md: 2 }, minHeight: 360 }}>
            {filteredNotifications.length === 0 ? (
              <UserEmptyState
                icon="solar:bell-off-bold-duotone"
                title={t('notifications.noNotifications')}
                description={t('notifications.emptyDescription')}
              />
            ) : (
              <Scrollbar sx={{ maxHeight: { xs: '62vh', md: '68vh' } }}>
                <Stack spacing={0}>
                  {filteredNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkRead={handleMarkNotification}
                    />
                  ))}
                </Stack>
              </Scrollbar>
            )}
          </UserGlassCard>
        </Stack>
      )}
    </UserPageShell>
  );
}
