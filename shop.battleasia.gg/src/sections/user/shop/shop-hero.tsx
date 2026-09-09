import type { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { USER_COLORS } from 'src/layouts/user';
import { SHOP_HERO_IMAGE } from './shop-constants';

// ----------------------------------------------------------------------

const GOLD = USER_COLORS.gold;
const goldAlpha = (opacity: number) => alpha(USER_COLORS.gold, opacity);

type ShopHeroProps = {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
};

/** 100% Exact Match Storefront Hero Banner matching reference image */
export function ShopHero({ title, subtitle, action }: ShopHeroProps) {
  const displayTitle = title || 'BAC COIN SHOP';
  const displaySubtitle = subtitle || 'Secure payments • Instant BAC delivery after approval';

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        mb: 3.5,
        minHeight: { xs: 220, sm: 280, md: 320 },
        display: 'flex',
        alignItems: 'center',
        borderRadius: '12px',
        overflow: 'hidden',
        bgcolor: '#0a101d',
        border: `1px solid ${goldAlpha(0.5)}`,
        boxShadow: `0 20px 50px ${alpha('#000000', 0.95)}, inset 0 0 40px ${goldAlpha(0.08)}`,
        p: { xs: 2.5, sm: 4, md: 5 },
      }}
    >
      {/* Crowned horse medallion hero background */}
      <Box
        component="img"
        src={SHOP_HERO_IMAGE}
        alt="BAC Store Hero"
        sx={{
          position: 'absolute',
          inset: 0,
          width: 1,
          height: 1,
          objectFit: 'cover',
          objectPosition: { xs: '70% center', sm: 'center right' },
          pointerEvents: 'none',
        }}
      />

      {/* Left-weighted scrim so title stays readable while horse stays visible on the right */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(90deg, ${alpha('#0a101d', 0.92)} 0%, ${alpha('#0a101d', 0.62)} 42%, ${alpha('#0a101d', 0.18)} 68%, transparent 82%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Hero Content Stack */}
      <Stack
        spacing={1.5}
        sx={{
          position: 'relative',
          zIndex: 3,
          maxWidth: { xs: '100%', md: 540 },
        }}
      >
        <Typography
          className="font-tr"
          sx={{
            fontSize: { xs: 30, sm: 44, md: 50 },
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: 1,
            textTransform: 'uppercase',
            background: `linear-gradient(180deg, #FFF4A3 0%, #E5B842 50%, #A67C1E 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: `drop-shadow(0 4px 12px ${alpha('#000000', 0.85)})`,
          }}
        >
          {displayTitle}
        </Typography>

        <Typography
          sx={{
            fontSize: { xs: 13, sm: 15 },
            fontWeight: 500,
            color: alpha('#ffffff', 0.75),
            lineHeight: 1.5,
            textShadow: `0 2px 8px ${alpha('#000000', 0.9)}`,
          }}
        >
          {displaySubtitle}
        </Typography>

        {action && <Box sx={{ pt: 1 }}>{action}</Box>}
      </Stack>
    </Box>
  );
}



