import { Box, Grid2 as Grid, Skeleton, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { GLASS_CARD_RADIUS, getDefaultGlassTokens, getGlassShellSx } from 'src/components/battle-glass-card';

// ----------------------------------------------------------------------

export function ShopDetailSkeleton() {
  const tokens = getDefaultGlassTokens();

  return (
    <Stack spacing={3}>
      <Skeleton width={100} height={36} sx={{ bgcolor: alpha('#ffffff', 0.06) }} />

      <Box sx={getGlassShellSx(tokens, { height: 140, p: 0, overflow: 'hidden' })}>
        <Skeleton variant="rectangular" width="100%" height="100%" sx={{ bgcolor: alpha('#ffffff', 0.04) }} />
      </Box>

      <Skeleton width="45%" sx={{ bgcolor: alpha('#ffffff', 0.06) }} />
      <Skeleton width="70%" sx={{ bgcolor: alpha('#ffffff', 0.04) }} />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Box sx={getGlassShellSx(tokens, { p: 2, overflow: 'hidden' })}>
            <Skeleton
              variant="rounded"
              height={360}
              sx={{ bgcolor: alpha('#ffffff', 0.04), borderRadius: `${GLASS_CARD_RADIUS}px` }}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Stack spacing={2}>
            <Box sx={getGlassShellSx(tokens, { p: 2.5, minHeight: 220 })}>
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton
                  key={index}
                  variant="rounded"
                  height={28}
                  sx={{ mt: index ? 1.25 : 0, bgcolor: alpha('#ffffff', 0.04) }}
                />
              ))}
            </Box>
            <Skeleton variant="rounded" height={52} sx={{ bgcolor: alpha('#ffffff', 0.04) }} />
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}
