import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import {
  getDefaultGlassTokens,
  getGlassBadgeChipSx,
  getGlassShellSx,
} from 'src/components/battle-glass-card';
import { Iconify } from 'src/components/iconify';
import { USER_COLORS } from 'src/layouts/user';

import { SHOP_HERO_IMAGE } from './shop-constants';

type ShopHeroProps = {
  title?: string;
  subtitle?: string;
};

export function ShopHero({ title = 'BAC Coin Shop', subtitle = 'Buy BattleAsia coins securely' }: ShopHeroProps) {
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
          backgroundImage: `url(${SHOP_HERO_IMAGE})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `
            linear-gradient(90deg, ${alpha('#000000', 0.82)} 0%, ${alpha('#000000', 0.45)} 55%, transparent 100%),
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
          maxWidth: { md: '70%' },
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
          Official Store
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
          <Box sx={{ ...getGlassBadgeChipSx(tokens), border: `1px solid ${alpha(USER_COLORS.gold, 0.35)}` }}>
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ px: 0.5 }}>
              <Iconify icon="solar:shield-check-bold" width={12} sx={{ color: USER_COLORS.gold }} />
              <Typography sx={{ fontSize: 10, fontWeight: 800, color: USER_COLORS.gold }}>Verified</Typography>
            </Stack>
          </Box>
        </Stack>
        <Typography sx={{ fontSize: 13, color: alpha('#ffffff', 0.75) }}>{subtitle}</Typography>
      </Stack>
    </Box>
  );
}
