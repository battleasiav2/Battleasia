import { Box, Grid2 as Grid, Skeleton, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { GLASS_CARD_RADIUS, getDefaultGlassTokens, getGlassShellSx } from 'src/components/battle-glass-card';

// ----------------------------------------------------------------------

export function ProfilePageSkeleton() {
  const tokens = getDefaultGlassTokens();

  return (
    <Stack spacing={3}>
      <Box sx={getGlassShellSx(tokens, { height: 120, p: 0, overflow: 'hidden' })}>
        <Skeleton variant="rectangular" width="100%" height="100%" sx={{ bgcolor: alpha('#ffffff', 0.04) }} />
      </Box>

      <Box sx={getGlassShellSx(tokens, { p: 2.5 })}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <Skeleton variant="circular" width={96} height={96} sx={{ bgcolor: alpha('#ffffff', 0.06) }} />
          <Box sx={{ flex: 1, width: 1 }}>
            <Skeleton width="45%" sx={{ bgcolor: alpha('#ffffff', 0.06) }} />
            <Skeleton width="30%" sx={{ mt: 1, bgcolor: alpha('#ffffff', 0.04) }} />
          </Box>
        </Stack>
      </Box>

      <Grid container spacing={1.5}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Grid key={i} size={{ xs: 6, md: 3 }}>
            <Skeleton variant="rounded" height={96} sx={{ borderRadius: `${GLASS_CARD_RADIUS}px`, bgcolor: alpha('#ffffff', 0.04) }} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Skeleton variant="rounded" height={320} sx={{ borderRadius: `${GLASS_CARD_RADIUS}px`, bgcolor: alpha('#ffffff', 0.04) }} />
        </Grid>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Skeleton variant="rounded" height={480} sx={{ borderRadius: `${GLASS_CARD_RADIUS}px`, bgcolor: alpha('#ffffff', 0.04) }} />
        </Grid>
      </Grid>
    </Stack>
  );
}
