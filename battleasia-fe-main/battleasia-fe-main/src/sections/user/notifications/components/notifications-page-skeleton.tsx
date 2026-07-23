import { Box, Skeleton, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { GLASS_CARD_RADIUS, getDefaultGlassTokens, getGlassShellSx } from 'src/components/battle-glass-card';

// ----------------------------------------------------------------------

export function NotificationsPageSkeleton() {
  const tokens = getDefaultGlassTokens();

  return (
    <Stack spacing={3}>
      <Box sx={getGlassShellSx(tokens, { height: 140, p: 0, overflow: 'hidden' })}>
        <Skeleton variant="rectangular" width="100%" height="100%" sx={{ bgcolor: alpha('#ffffff', 0.04) }} />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 1.5 }}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} variant="rounded" height={96} sx={{ borderRadius: `${GLASS_CARD_RADIUS}px`, bgcolor: alpha('#ffffff', 0.04) }} />
        ))}
      </Box>

      <Skeleton variant="rounded" height={48} sx={{ borderRadius: `${GLASS_CARD_RADIUS}px`, bgcolor: alpha('#ffffff', 0.04) }} />

      <Box sx={getGlassShellSx(tokens, { p: 2 })}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} variant="rounded" height={88} sx={{ mb: 1, bgcolor: alpha('#ffffff', 0.04) }} />
        ))}
      </Box>
    </Stack>
  );
}
