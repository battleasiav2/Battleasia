import { useState, useCallback } from 'react';

import { alpha } from '@mui/material/styles';
import { Box, Stack, Typography } from '@mui/material';

import {
  goldAlpha,
  USER_COLORS,
  UserPageShell,
  UserEmptyState,
  UserActionButton,
  UserAnimatedStat,
} from 'src/layouts/user';

import { Iconify } from 'src/components/iconify';
import { PlayTabs } from 'src/components/play-tabs';
import { Scrollbar } from 'src/components/scrollbar';

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

const GOLD = USER_COLORS.gold;

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

  const markAllAction =
    unreadCount > 0 ? (
      <UserActionButton
        actionVariant="ghost"
        size="small"
        onClick={handleMarkAllAsRead}
        startIcon={<Iconify icon="hugeicons:tick-double-02" />}
        sx={{ py: 0.75, px: 1.5, fontSize: 12 }}
      >
        {t('notifications.markAllAsRead')}
      </UserActionButton>
    ) : undefined;

  const statCells = [
    {
      label: t('notifications.all'),
      value: <UserAnimatedStat value={notifications.length} variant="h5" fontWeight={700} />,
    },
    {
      label: t('notifications.unread'),
      value: <UserAnimatedStat value={unreadCount} variant="h5" fontWeight={700} />,
    },
    {
      label: t('notifications.archived'),
      value: <UserAnimatedStat value={archivedCount} variant="h5" fontWeight={700} />,
    },
  ];

  return (
    <UserPageShell contentSx={{ maxWidth: 860, mx: 'auto' }}>
      <NotificationsHero title={t('notifications.title')} action={markAllAction} />

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
        <Stack spacing={2.5}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(3, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' },
              width: 1,
              bgcolor: alpha('#06090e', 0.72),
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              border: `1px solid ${goldAlpha(0.28)}`,
              borderTop: `2px solid ${GOLD}`,
              boxShadow: `0 10px 28px ${alpha('#000000', 0.55)}, inset 0 0 16px ${goldAlpha(0.04)}`,
              clipPath: {
                xs: 'none',
                md: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)',
              },
            }}
          >
            {statCells.map((cell, index) => (
              <Box
                key={cell.label}
                sx={{
                  minWidth: 0,
                  px: { xs: 1.25, md: 2.25 },
                  py: { xs: 1.5, md: 2 },
                  borderRight:
                    index < statCells.length - 1 ? `1px solid ${alpha('#ffffff', 0.1)}` : 'none',
                }}
              >
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 0.8,
                    textTransform: 'uppercase',
                    color: alpha('#ffffff', 0.45),
                    mb: 0.75,
                  }}
                >
                  {cell.label}
                </Typography>
                <Box sx={{ color: USER_COLORS.textPrimary }}>{cell.value}</Box>
              </Box>
            ))}
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

          {filteredNotifications.length === 0 ? (
            <UserEmptyState
              icon="solar:bell-off-bold-duotone"
              title={t('notifications.noNotifications')}
              description={t('notifications.emptyDescription')}
            />
          ) : (
            <Box
              sx={{
                bgcolor: alpha('#06090e', 0.72),
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                border: `1px solid ${goldAlpha(0.28)}`,
                borderTop: `2px solid ${GOLD}`,
                boxShadow: `0 10px 28px ${alpha('#000000', 0.55)}, inset 0 0 16px ${goldAlpha(0.04)}`,
                clipPath: {
                  xs: 'none',
                  md: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)',
                },
                overflow: 'hidden',
              }}
            >
              <Scrollbar sx={{ maxHeight: { xs: '62vh', md: '68vh' } }}>
                {filteredNotifications.map((notification, index) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={handleMarkNotification}
                    isLast={index === filteredNotifications.length - 1}
                  />
                ))}
              </Scrollbar>
            </Box>
          )}
        </Stack>
      )}
    </UserPageShell>
  );
}
