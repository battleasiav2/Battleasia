import { Box, Grid2 as Grid, Skeleton, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { GLASS_CARD_RADIUS, getDefaultGlassTokens, getGlassShellSx } from 'src/components/battle-glass-card';

// ----------------------------------------------------------------------

export function MyMatchesPageSkeleton() {
  const tokens = getDefaultGlassTokens();

  return (
    <Stack spacing={3}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 1.5 }}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Box key={index} sx={getGlassShellSx(tokens, { minHeight: 96, p: 2 })}>
            <Skeleton width="55%" sx={{ bgcolor: alpha('#ffffff', 0.06) }} />
            <Skeleton width="35%" sx={{ mt: 1, bgcolor: alpha('#ffffff', 0.04) }} />
          </Box>
        ))}
      </Box>

      <Skeleton
        variant="rounded"
        height={48}
        sx={{ borderRadius: `${GLASS_CARD_RADIUS}px`, bgcolor: alpha('#ffffff', 0.04) }}
      />

      <Grid container spacing={2}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, lg: 4 }}>
            <Box sx={getGlassShellSx(tokens, { p: 0, overflow: 'hidden' })}>
              <Skeleton variant="rectangular" height={148} sx={{ bgcolor: alpha('#ffffff', 0.04) }} />
              <Stack spacing={1} sx={{ p: 2 }}>
                <Skeleton width="80%" sx={{ bgcolor: alpha('#ffffff', 0.06) }} />
                <Skeleton width="60%" sx={{ bgcolor: alpha('#ffffff', 0.04) }} />
                <Skeleton variant="rounded" height={40} sx={{ bgcolor: alpha('#ffffff', 0.04) }} />
              </Stack>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
