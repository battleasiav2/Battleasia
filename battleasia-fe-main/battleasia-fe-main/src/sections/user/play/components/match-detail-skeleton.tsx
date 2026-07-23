import { Box, Grid2 as Grid, Skeleton, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { GLASS_CARD_RADIUS, getDefaultGlassTokens, getGlassShellSx } from 'src/components/battle-glass-card';

// ----------------------------------------------------------------------

export function MatchDetailSkeleton() {
  const tokens = getDefaultGlassTokens();

  return (
    <Stack spacing={3}>
      <Box sx={getGlassShellSx(tokens, { height: { xs: 260, md: 360 }, p: 0, overflow: 'hidden' })}>
        <Skeleton variant="rectangular" width="100%" height="100%" sx={{ bgcolor: alpha('#ffffff', 0.04) }} />
      </Box>

      <Grid container spacing={1.5}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Grid key={i} size={{ xs: 6, sm: 4, md: 'grow' }}>
            <Skeleton
              variant="rounded"
              height={72}
              sx={{ borderRadius: `${GLASS_CARD_RADIUS}px`, bgcolor: alpha('#ffffff', 0.04) }}
            />
          </Grid>
        ))}
      </Grid>

      <Skeleton variant="rounded" height={52} sx={{ borderRadius: `${GLASS_CARD_RADIUS}px`, bgcolor: alpha('#ffffff', 0.04) }} />

      <Box sx={getGlassShellSx(tokens, { p: 3 })}>
        <Skeleton width="40%" sx={{ bgcolor: alpha('#ffffff', 0.06) }} />
        <Skeleton width="90%" sx={{ mt: 2, bgcolor: alpha('#ffffff', 0.04) }} />
        <Skeleton width="75%" sx={{ mt: 1, bgcolor: alpha('#ffffff', 0.04) }} />
      </Box>
    </Stack>
  );
}
