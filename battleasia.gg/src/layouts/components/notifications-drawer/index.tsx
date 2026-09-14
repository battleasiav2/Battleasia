import type { IconButtonProps } from '@mui/material/IconButton';

import { useMemo, useState, useCallback } from 'react';
import { useBoolean } from 'minimal-shared/hooks';

import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { PlayTabs } from 'src/components/play-tabs';
import { useNotificationsPolling } from 'src/hooks/use-notifications-polling';
import { useTranslate } from 'src/locales/use-locales';
import {
  USER_COLORS,
  UserActionButton,
  UserEmptyState,
  userGlassDialogPaperSx,
  userMutedTextSx } from 'src/layouts/user';

import { NotificationItem } from 'src/sections/user/notifications/components/notification-item';

// ----------------------------------------------------------------------

export type NotificationsDrawerProps = IconButtonProps;

export function NotificationsDrawer({ sx, ...other }: NotificationsDrawerProps) {
  const { t } = useTranslate();
  const router = useRouter();
  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();

  const [currentTab, setCurrentTab] = useState('all');

  const {
    notifications,
    unreadCount,
    loading,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    fetchNotifications,
  } = useNotificationsPolling();

  const handleChangeTab = useCallback((newValue: string) => {
    setCurrentTab(newValue);
  }, []);

  const filteredNotifications = useMemo(() => {
    if (currentTab === 'unread') {
      return notifications.filter((n) => n.isUnRead);
    }
    if (currentTab === 'archived') {
      return notifications.filter((n) => !n.isUnRead);
    }
    return notifications;
  }, [notifications, currentTab]);

  const archivedCount = Math.max(notifications.length - unreadCount, 0);

  const handleMarkAllAsRead = useCallback(() => {
    markAllNotificationsAsRead();
  }, [markAllNotificationsAsRead]);

  const handleRefresh = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleViewAll = useCallback(() => {
    onClose();
    router.push(paths.user.account.notifications);
  }, [onClose, router]);

  const renderHead = () => (
    <Box
      sx={{
        py: 2,
        pr: 1,
        pl: 2.5,
        minHeight: 68,
        display: 'flex',
        alignItems: 'center',
        borderBottom: `1px solid ${USER_COLORS.border}`,
      }}
    >
      <Typography variant="h6" sx={{ flexGrow: 1, color: USER_COLORS.textPrimary, fontWeight: 800 }}>
        {t('notifications.title')}
      </Typography>

      <Tooltip title={t('common.refresh')}>
        <IconButton onClick={handleRefresh} disabled={loading} sx={{ color: USER_COLORS.textSubtle }}>
          <Iconify icon="solar:refresh-bold" />
        </IconButton>
      </Tooltip>

      {!!unreadCount && (
        <Tooltip title={t('notifications.markAllAsRead')}>
          <IconButton onClick={handleMarkAllAsRead} sx={{ color: USER_COLORS.gold }}>
            <Iconify icon="hugeicons:tick-double-02" />
          </IconButton>
        </Tooltip>
      )}

      <IconButton onClick={onClose} sx={{ color: USER_COLORS.textSubtle, display: { xs: 'inline-flex', sm: 'none' } }}>
        <Iconify icon="mingcute:close-line" />
      </IconButton>
    </Box>
  );

  const renderList = () => {
    if (loading && notifications.length === 0) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress sx={{ color: USER_COLORS.gold }} />
        </Box>
      );
    }

    if (filteredNotifications.length === 0) {
      return (
        <UserEmptyState
          icon="solar:bell-off-bold-duotone"
          title={t('notifications.noNotifications')}
          description={t('notifications.emptyDescription')}
          sx={{ py: 6, border: 'none', bgcolor: 'transparent' }}
        />
      );
    }

    return (
      <Scrollbar sx={{ maxHeight: 'calc(100vh - 280px)' }}>
        <Stack spacing={0} sx={{ p: 1.5 }}>
          {filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={{
                id: notification.id,
                type: notification.type,
                title: notification.title,
                subject: notification.subject,
                category: notification.category,
                isUnRead: notification.isUnRead,
                avatarUrl: notification.avatarUrl,
                createdAt: notification.createdAt,
              }}
              onMarkRead={markNotificationAsRead}
            />
          ))}
        </Stack>
      </Scrollbar>
    );
  };

  return (
    <>
      <IconButton
        aria-label="Notifications button"
        onClick={onOpen}
        sx={[
          {
            position: 'relative',
            width: 44,
            height: 44,
            p: 0,
            borderRadius: '10px',
            bgcolor: open ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
            backgroundImage: 'none',
            border: `1px solid ${open ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.09)'}`,
            boxShadow: 'none',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            flexShrink: 0,
            transition: 'background-color 0.25s ease, border-color 0.25s ease',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.05)',
              borderColor: 'rgba(255,255,255,0.14)',
              '& .notif-bell': {
                color: USER_COLORS.gold,
              },
            },
            '&:active': { transform: 'none' },
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...other}
      >
        <Badge
          badgeContent={unreadCount}
          max={9}
          overlap="circular"
          sx={{
            '& .MuiBadge-badge': {
              minWidth: 16,
              height: 16,
              px: 0.4,
              fontSize: 10,
              fontWeight: 800,
              bgcolor: 'var(--ba-gold)',
              color: 'var(--ba-gold-ink, #081401)',
              border: '1px solid rgba(6,6,7,0.85)',
            },
          }}
        >
          <Iconify
            className="notif-bell"
            icon="solar:bell-bold"
            width={20}
            sx={{
              color: open || unreadCount > 0 ? 'var(--ba-gold)' : alpha('#ffffff', 0.92),
              transition: 'color 0.2s ease',
            }}
          />
        </Badge>
      </IconButton>

      <Drawer
        open={open}
        onClose={onClose}
        anchor="right"
        slotProps={{ backdrop: { invisible: true } }}
        PaperProps={{
          sx: {
            ...(userGlassDialogPaperSx as object),
            width: 1,
            maxWidth: 420,
            bgcolor: alpha('#000000', 0.94),
            backgroundImage: 'none',
            color: USER_COLORS.textBody,
            borderLeft: `1px solid ${USER_COLORS.border}`,
          },
        }}
      >
        {renderHead()}

        <Box sx={{ px: 1.5, pt: 1.5, pb: 0.5 }}>
          <PlayTabs
            tabs={[
              { label: `${t('notifications.all')} (${notifications.length})`, value: 'all' },
              { label: `${t('notifications.unread')} (${unreadCount})`, value: 'unread' },
              { label: `${t('notifications.archived')} (${archivedCount})`, value: 'archived' },
            ]}
            activeTab={currentTab}
            onChange={handleChangeTab}
          />
        </Box>

        {renderList()}

        <Box sx={{ p: 1.5, borderTop: `1px solid ${USER_COLORS.border}` }}>
          <UserActionButton actionVariant="gold" fullWidth size="large" onClick={handleViewAll}>
            {t('notifications.viewAll')}
          </UserActionButton>
          <Typography sx={{ ...userMutedTextSx, fontSize: 11, textAlign: 'center', mt: 1 }}>
            {unreadCount > 0
              ? `${unreadCount} ${t('notifications.unread').toLowerCase()}`
              : t('notifications.emptyDescription')}
          </Typography>
        </Box>
      </Drawer>
    </>
  );
}
