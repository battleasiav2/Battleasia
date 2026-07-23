import { Box, Stack, Avatar, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { fToNow } from 'src/utils/format-time';

import { CONFIG } from 'src/global-config';
import { Iconify } from 'src/components/iconify';
import { getDefaultGlassTokens, getGlassInnerSx } from 'src/components/battle-glass-card';

import { USER_COLORS } from 'src/layouts/user';

// ----------------------------------------------------------------------

export type NotificationItemProps = {
  notification: {
    id: string;
    type: string;
    title: string;
    subject?: string;
    category: string;
    isUnRead: boolean;
    avatarUrl: string | null;
    createdAt: string | number | null;
  };
  onMarkRead?: (id: string) => void;
};

const typeIconMap: Record<string, string> = {
  order: 'solar:bag-3-bold-duotone',
  chat: 'solar:chat-round-dots-bold-duotone',
  mail: 'solar:letter-bold-duotone',
  delivery: 'solar:delivery-bold-duotone',
  general: 'solar:bell-bold-duotone',
};

const readerContent = (data: string) => (
  <Box
    dangerouslySetInnerHTML={{ __html: data }}
    sx={{
      color: USER_COLORS.textSubtle,
      fontSize: 13,
      lineHeight: 1.55,
      '& p': { m: 0 },
      '& a': { color: USER_COLORS.gold, textDecoration: 'none' },
      '& strong': { color: USER_COLORS.textPrimary, fontWeight: 700 },
    }}
  />
);

export function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  const tokens = getDefaultGlassTokens();
  const combinedTitle = notification.subject
    ? `<p><strong>${notification.subject}</strong></p>${notification.title}`
    : notification.title;

  const legacyIconMap: Record<string, string> = {
    order: 'ic-order',
    chat: 'ic-chat',
    mail: 'ic-mail',
    delivery: 'ic-delivery',
  };
  const legacyIcon = legacyIconMap[notification.type];
  const iconifyIcon = typeIconMap[notification.type] || typeIconMap.general;

  return (
    <Box
      onClick={() => onMarkRead?.(notification.id)}
      sx={getGlassInnerSx(tokens, {
        p: 2,
        mb: 1,
        display: 'flex',
        gap: 1.5,
        alignItems: 'flex-start',
        cursor: 'pointer',
        position: 'relative',
        borderColor: notification.isUnRead ? alpha(USER_COLORS.info, 0.25) : undefined,
        bgcolor: notification.isUnRead ? alpha(USER_COLORS.info, 0.05) : undefined,
        transition: 'border-color 0.2s ease, background-color 0.2s ease',
        '&:hover': {
          borderColor: alpha(USER_COLORS.gold, 0.25),
          bgcolor: alpha('#ffffff', 0.04),
        },
      })}
    >
      {notification.isUnRead ? (
        <Box
          sx={{
            position: 'absolute',
            top: 14,
            right: 14,
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: USER_COLORS.info,
            boxShadow: `0 0 10px ${alpha(USER_COLORS.info, 0.7)}`,
          }}
        />
      ) : null}

      {notification.avatarUrl ? (
        <Avatar src={notification.avatarUrl} sx={{ width: 44, height: 44, flexShrink: 0 }} />
      ) : legacyIcon ? (
        <Box
          sx={{
            width: 44,
            height: 44,
            flexShrink: 0,
            display: 'flex',
            borderRadius: '50%',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(USER_COLORS.gold, 0.1),
            border: `1px solid ${alpha(USER_COLORS.gold, 0.22)}`,
          }}
        >
          <Box
            component="img"
            src={`${CONFIG.assetsDir}/assets/icons/notification/${legacyIcon}.svg`}
            sx={{ width: 22, height: 22 }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </Box>
      ) : (
        <Box
          sx={{
            width: 44,
            height: 44,
            flexShrink: 0,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(USER_COLORS.gold, 0.12),
            border: `1px solid ${alpha(USER_COLORS.gold, 0.28)}`,
            color: USER_COLORS.gold,
          }}
        >
          <Iconify icon={iconifyIcon} width={22} />
        </Box>
      )}

      <Box sx={{ flex: 1, minWidth: 0, pr: notification.isUnRead ? 2 : 0 }}>
        {readerContent(combinedTitle)}

        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 1 }} flexWrap="wrap">
          <Typography sx={{ fontSize: 11, color: USER_COLORS.textMuted }}>
            {fToNow(notification.createdAt)}
          </Typography>
          <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: USER_COLORS.textMuted }} />
          <Typography
            sx={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 0.6,
              textTransform: 'uppercase',
              color: USER_COLORS.gold,
            }}
          >
            {notification.category}
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}
