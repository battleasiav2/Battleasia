import { Box, Skeleton, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { GLASS_CARD_RADIUS, getDefaultGlassTokens, getGlassShellSx } from 'src/components/battle-glass-card';

// ----------------------------------------------------------------------

export function LeaderboardPageSkeleton() {
  const tokens = getDefaultGlassTokens();

  return (
    <Stack spacing={3}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 1.5 }}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} variant="rounded" height={220} sx={{ borderRadius: `${GLASS_CARD_RADIUS}px`, bgcolor: alpha('#ffffff', 0.04) }} />
        ))}
      </Box>

      <Box sx={getGlassShellSx(tokens, { p: 2 })}>
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} variant="rounded" height={64} sx={{ mb: 1, bgcolor: alpha('#ffffff', 0.04) }} />
        ))}
      </Box>
    </Stack>
  );
}
