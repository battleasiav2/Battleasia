import type { ReactNode } from 'react';

import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { UserArenaStrip, USER_COLORS } from 'src/layouts/user';
import { useTranslate } from 'src/locales/use-locales';

import { SUPPORT_HERO_IMAGE } from '../customer-support-constants';

// ----------------------------------------------------------------------

type SupportHeroProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export function SupportHero({ title, subtitle, action }: SupportHeroProps) {
  const { t } = useTranslate();

  return (
    <UserArenaStrip
      badge={t('customerSupport.badgeLiveSupport') || 'Live Support'}
      title={title}
      subtitle={subtitle}
      imageUrl={SUPPORT_HERO_IMAGE}
      action={action}
      chip={
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.6}
          sx={{
            px: 1,
            py: 0.4,
            border: `1px solid ${alpha(USER_COLORS.success, 0.4)}`,
            bgcolor: alpha('#000000', 0.5),
          }}
        >
          <Box
            sx={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              bgcolor: USER_COLORS.success,
              boxShadow: `0 0 8px ${alpha(USER_COLORS.success, 0.85)}`,
            }}
          />
          <Typography sx={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.8, color: '#ffffff' }}>
            {t('customerSupport.online') || 'ONLINE'}
          </Typography>
          <Iconify icon="solar:headphones-round-sound-bold" width={12} sx={{ color: USER_COLORS.gold }} />
        </Stack>
      }
    />
  );
}
