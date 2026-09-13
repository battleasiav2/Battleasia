import { Box, Stack, Avatar, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { fToNow } from 'src/utils/format-time';

import { CONFIG } from 'src/global-config';
import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales/use-locales';

import { USER_COLORS, goldAlpha } from 'src/layouts/user';

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
  isLast?: boolean;
};

const typeIconMap: Record<string, string> = {
  order: 'solar:bag-3-bold-duotone',
  chat: 'solar:chat-round-dots-bold-duotone',
  mail: 'solar:letter-bold-duotone',
  delivery: 'solar:delivery-bold-duotone',
  general: 'solar:bell-bold-duotone',
  engagement_mission_complete: 'solar:flag-bold',
  engagement_claim_ready: 'solar:gift-bold',
  engagement_streak_at_risk: 'solar:fire-bold',
  engagement_badge_unlocked: 'solar:medal-ribbons-star-bold',
};

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Shop-style horizontal row — no nested glass. */
export function NotificationItem({ notification, onMarkRead, isLast = false }: NotificationItemProps) {
  const { t } = useTranslate();

  const titleText = notification.subject
    ? notification.subject
    : stripHtml(notification.title) || notification.category;

  const previewText = notification.subject
    ? stripHtml(notification.title)
    : null;

  const legacyIconMap: Record<string, string> = {
    order: 'ic-order',
    chat: 'ic-chat',
    mail: 'ic-mail',
    delivery: 'ic-delivery',
  };
  const legacyIcon = legacyIconMap[notification.type];
  const iconifyIcon = typeIconMap[notification.type] || typeIconMap.general;

  const statusLabel = notification.isUnRead ? t('notifications.unread') : null;
  const statusColor = USER_COLORS.info;

  const metaBits = [
    fToNow(notification.createdAt),
    notification.category,
    previewText || null,
  ].filter(Boolean);

  return (
    <Box
      component="button"
      type="button"
      onClick={() => onMarkRead?.(notification.id)}
      sx={{
        all: 'unset',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 1.25, sm: 1.75 },
        width: 1,
        px: { xs: 1.5, sm: 2 },
        py: { xs: 1.25, sm: 1.5 },
        cursor: 'pointer',
        borderBottom: isLast ? 'none' : `1px solid ${alpha('#ffffff', 0.08)}`,
        bgcolor: notification.isUnRead ? goldAlpha(0.04) : 'transparent',
        transition: 'background-color 0.2s ease',
        '&:hover': {
          bgcolor: goldAlpha(0.06),
          '& .notif-title': { color: USER_COLORS.gold },
        },
      }}
    >
      {notification.avatarUrl ? (
        <Avatar
          src={notification.avatarUrl}
          sx={{
            width: { xs: 40, sm: 48 },
            height: { xs: 40, sm: 48 },
            flexShrink: 0,
            borderRadius: 0,
            border: `1px solid ${alpha('#ffffff', 0.1)}`,
          }}
        />
      ) : legacyIcon ? (
        <Box
          sx={{
            width: { xs: 40, sm: 48 },
            height: { xs: 40, sm: 48 },
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#0a0a0a',
            border: `1px solid ${alpha('#ffffff', 0.1)}`,
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
            width: { xs: 40, sm: 48 },
            height: { xs: 40, sm: 48 },
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#0a0a0a',
            border: `1px solid ${alpha('#ffffff', 0.1)}`,
            color: USER_COLORS.gold,
          }}
        >
          <Iconify icon={iconifyIcon} width={22} />
        </Box>
      )}

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
          <Typography
            className="notif-title font-tr"
            sx={{
              fontSize: { xs: 13, sm: 15 },
              fontWeight: 800,
              color: USER_COLORS.textPrimary,
              textTransform: 'uppercase',
              lineHeight: 1.2,
              transition: 'color 0.2s ease',
            }}
          >
            {titleText}
          </Typography>
          {statusLabel ? (
            <Typography
              sx={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: 0.6,
                textTransform: 'uppercase',
                color: statusColor,
              }}
            >
              {statusLabel}
            </Typography>
          ) : null}
        </Stack>

        <Typography
          sx={{
            mt: 0.5,
            fontSize: { xs: 11, sm: 12 },
            color: alpha('#ffffff', 0.5),
            lineHeight: 1.35,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {metaBits.join(' · ')}
        </Typography>
      </Box>

      {notification.isUnRead ? (
        <Box
          sx={{
            width: 8,
            height: 8,
            flexShrink: 0,
            borderRadius: '50%',
            bgcolor: USER_COLORS.info,
          }}
        />
      ) : null}
    </Box>
  );
}
