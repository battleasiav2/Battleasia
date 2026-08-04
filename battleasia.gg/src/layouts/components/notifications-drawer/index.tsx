import type { IconButtonProps } from '@mui/material/IconButton';

import { m } from 'framer-motion';
import { useMemo, useState, useCallback } from 'react';
import { useBoolean } from 'minimal-shared/hooks';

import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { PlayTabs } from 'src/components/play-tabs';
import { varTap, varHover, transitionTap } from 'src/components/animate';
import { useNotificationsPolling } from 'src/hooks/use-notifications-polling';
import { useTranslate } from 'src/locales/use-locales';
import {
  USER_COLORS,
  UserActionButton,
  UserEmptyState,
  userGlassDialogPaperSx,
  userMutedTextSx,
} from 'src/layouts/user';

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
        component={m.button}
        whileTap={varTap(0.96)}
        whileHover={varHover(1.04)}
        transition={transitionTap()}
        aria-label="Notifications button"
        onClick={onOpen}
        sx={[
          {
            width: { xs: 36, sm: 42 },
            height: { xs: 32, sm: 38 },
            p: 0,
            borderRadius: '6px',
            bgcolor: open ? alpha(USER_COLORS.gold, 0.14) : alpha('#080c14', 0.55),
            border: '1.5px solid',
            borderColor: open ? alpha(USER_COLORS.gold, 0.55) : alpha('#ffffff', 0.18),
            boxShadow: `inset 0 0 0 1px ${alpha('#000000', 0.25)}`,
            transition: 'background-color 0.2s ease, border-color 0.2s ease',
            '&:hover': {
              bgcolor: alpha('#0c121c', 0.72),
              borderColor: alpha(USER_COLORS.gold, 0.45),
            },
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...other}
      >
        <Badge
          badgeContent={unreadCount}
          color="error"
          max={99}
          sx={{
            '& .MuiBadge-badge': {
              fontSize: 10,
              fontWeight: 800,
              minWidth: 16,
              height: 16,
              px: 0.5,
              top: 2,
              right: 2,
              border: `1.5px solid ${alpha('#000000', 0.85)}`,
            },
          }}
        >
          <Iconify
            icon="solar:bell-bold"
            width={20}
            sx={{
              color: open ? USER_COLORS.gold : alpha('#ffffff', 0.92),
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
