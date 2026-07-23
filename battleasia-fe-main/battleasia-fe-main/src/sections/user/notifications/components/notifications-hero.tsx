import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { useTranslate } from 'src/locales/use-locales';
import { Iconify } from 'src/components/iconify';
import {
  getDefaultGlassTokens,
  getGlassShellSx,
  getGlassBadgeChipSx,
} from 'src/components/battle-glass-card';

import { USER_COLORS } from 'src/layouts/user';

import { NOTIFICATIONS_HERO_IMAGE } from '../notifications-constants';

// ----------------------------------------------------------------------

type NotificationsHeroProps = {
  title: string;
  unreadCount: number;
};

export function NotificationsHero({ title, unreadCount }: NotificationsHeroProps) {
  const { t } = useTranslate();
  const tokens = getDefaultGlassTokens();

  return (
    <Box
      sx={getGlassShellSx(tokens, {
        position: 'relative',
        height: { xs: 120, md: 160 },
        p: 0,
        overflow: 'hidden',
        mb: 3,
      })}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${NOTIFICATIONS_HERO_IMAGE})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `
            linear-gradient(90deg, ${alpha('#000000', 0.85)} 0%, ${alpha('#000000', 0.45)} 55%, transparent 100%),
            linear-gradient(180deg, transparent 30%, ${alpha('#000000', 0.55)} 100%)
          `,
        }}
      />

      <Stack
        spacing={1}
        sx={{
          position: 'absolute',
          left: { xs: 16, md: 24 },
          bottom: { xs: 16, md: 20 },
          zIndex: 1,
        }}
      >
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.8,
            textTransform: 'uppercase',
            color: alpha(USER_COLORS.gold, 0.9),
          }}
        >
          {t('notifications.badgeInbox')}
        </Typography>

        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
          <Typography
            className="font-tr"
            sx={{
              fontSize: { xs: 22, md: 30 },
              fontWeight: 800,
              textTransform: 'uppercase',
              color: USER_COLORS.textPrimary,
              letterSpacing: 0.5,
            }}
          >
            {title}
          </Typography>

          {unreadCount > 0 ? (
            <Box sx={{ ...getGlassBadgeChipSx(tokens), border: `1px solid ${alpha(USER_COLORS.info, 0.35)}` }}>
              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ px: 0.5 }}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: USER_COLORS.info,
                    boxShadow: `0 0 8px ${alpha(USER_COLORS.info, 0.8)}`,
                  }}
                />
                <Typography sx={{ fontSize: 10, fontWeight: 800, color: USER_COLORS.info }}>
                  {unreadCount} NEW
                </Typography>
              </Stack>
            </Box>
          ) : null}
        </Stack>
      </Stack>
    </Box>
  );
}
