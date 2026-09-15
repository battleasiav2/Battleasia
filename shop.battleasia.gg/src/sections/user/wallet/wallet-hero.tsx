import type { ReactNode } from 'react';

import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { USER_IMAGES } from 'src/layouts/user';
import { goldAlpha } from 'src/theme/accent-presets';
import { useTranslate } from 'src/locales/use-locales';

import { SHOP_PANEL_SX } from '../shop/shop-styles';

// ----------------------------------------------------------------------

type WalletHeroProps = {
  title?: string;
  badge?: string;
  subtitle?: string;
  action?: ReactNode;
  chipLabel?: string;
  chipIcon?: string;
};

/** Glass hero — same landing / shop panel language (#161618). */
export function WalletHero({
  title,
  subtitle,
  action,
}: WalletHeroProps) {
  const { t } = useTranslate();

  const displayTitle = title || t('wallet.title') || 'BAC WALLET';
  const displaySubtitle =
    subtitle ||
    t('wallet.subtitle') ||
    'Real-time coin ledger • Instant withdrawal requests';

  return (
    <Box
      className="shop-animate-fade-in"
      sx={{
        ...SHOP_PANEL_SX,
        position: 'relative',
        width: '100%',
        mb: { xs: 2.5, md: 3.5 },
        minHeight: { xs: 148, sm: 200, md: 240 },
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        maxWidth: '100%',
        boxSizing: 'border-box',
        p: { xs: 1.75, sm: 3.5, md: 4.5 },
      }}
    >
      <Box
        component="img"
        src={USER_IMAGES.pageBg}
        alt=""
        loading="lazy"
        decoding="async"
        sx={{
          position: 'absolute',
          inset: 0,
          width: 1,
          height: 1,
          objectFit: 'cover',
          objectPosition: 'center right',
          pointerEvents: 'none',
          opacity: 0.45,
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `
            linear-gradient(90deg, rgba(6,6,7,0.92) 0%, rgba(6,6,7,0.55) 48%, rgba(6,6,7,0.2) 100%),
            radial-gradient(60% 80% at 80% 50%, ${goldAlpha(0.12)} 0%, transparent 70%)
          `,
          pointerEvents: 'none',
        }}
      />

      <Stack
        spacing={1.15}
        sx={{
          position: 'relative',
          zIndex: 2,
          maxWidth: { xs: '100%', md: 560 },
        }}
      >
        <Typography
          className="landing-display"
          sx={{
            fontFamily: '"Barlow", "Public Sans Variable", sans-serif',
            fontSize: { xs: 20, sm: 30, md: 36 },
            fontWeight: 800,
            lineHeight: 1.12,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            color: '#ffffff',
            overflowWrap: 'anywhere',
          }}
        >
          {displayTitle}
        </Typography>

        <Typography
          sx={{
            fontSize: { xs: 13, sm: 14 },
            fontWeight: 500,
            color: alpha('#ffffff', 0.62),
            lineHeight: 1.5,
            maxWidth: '42ch',
            fontFamily: '"Barlow", "Public Sans Variable", sans-serif',
          }}
        >
          {displaySubtitle}
        </Typography>

        {action ? <Box sx={{ pt: 0.5 }}>{action}</Box> : null}
      </Stack>

      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 2,
          bgcolor: goldAlpha(0.55),
          zIndex: 3,
        }}
      />
    </Box>
  );
}
