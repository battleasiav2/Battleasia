import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import {
  getDefaultGlassTokens,
  getGlassBadgeChipSx,
  getGlassShellSx,
} from 'src/components/battle-glass-card';
import { Iconify } from 'src/components/iconify';
import { USER_COLORS } from 'src/layouts/user';

export function WalletHero({ title = 'Wallet' }: { title?: string }) {
  const tokens = getDefaultGlassTokens();

  return (
    <Box
      sx={getGlassShellSx(tokens, {
        position: 'relative',
        height: { xs: 120, md: 160 },
        p: 0,
        overflow: 'hidden',
        mb: 3,
        backgroundImage: 'url(/assets/images/dashboard-pubg-black.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      })}
    >
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
      <Stack spacing={1} sx={{ position: 'absolute', left: { xs: 16, md: 24 }, bottom: { xs: 16, md: 20 }, zIndex: 1 }}>
        <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.8, textTransform: 'uppercase', color: alpha(USER_COLORS.gold, 0.9) }}>
          Secure Vault
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography className="font-tr" sx={{ fontSize: { xs: 22, md: 30 }, fontWeight: 800, textTransform: 'uppercase', color: USER_COLORS.textPrimary }}>
            {title}
          </Typography>
          <Box sx={{ ...getGlassBadgeChipSx(tokens), border: `1px solid ${alpha(USER_COLORS.gold, 0.35)}` }}>
            <Iconify icon="solar:wallet-money-bold" width={14} sx={{ color: USER_COLORS.gold }} />
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}
