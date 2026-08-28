import { Box, Grid2 as Grid, Skeleton, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { getDefaultGlassTokens, getGlassShellSx } from 'src/components/battle-glass-card';

// ----------------------------------------------------------------------

export function ShopPageSkeleton() {
  const tokens = getDefaultGlassTokens();

  return (
    <Stack spacing={3}>
      <Box sx={getGlassShellSx(tokens, { height: 140, p: 0, overflow: 'hidden' })}>
        <Skeleton variant="rectangular" width="100%" height="100%" sx={{ bgcolor: alpha('#ffffff', 0.04) }} />
      </Box>

      <Skeleton width="40%" sx={{ bgcolor: alpha('#ffffff', 0.06) }} />
      <Skeleton width="65%" sx={{ bgcolor: alpha('#ffffff', 0.04) }} />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Box sx={getGlassShellSx(tokens, { p: 2, overflow: 'hidden' })}>
            <Skeleton variant="rounded" height={360} sx={{ bgcolor: alpha('#ffffff', 0.04) }} />
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton
                  key={index}
                  variant="rounded"
                  width={72}
                  height={48}
                  sx={{ bgcolor: alpha('#ffffff', 0.04) }}
                />
              ))}
            </Stack>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Box sx={getGlassShellSx(tokens, { p: 2.5, minHeight: 420 })}>
            <Skeleton width="55%" sx={{ bgcolor: alpha('#ffffff', 0.06) }} />
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={index}
                variant="rounded"
                height={72}
                sx={{ mt: 1.25, bgcolor: alpha('#ffffff', 0.04) }}
              />
            ))}
            <Skeleton variant="rounded" height={48} sx={{ mt: 2, bgcolor: alpha('#ffffff', 0.04) }} />
          </Box>
        </Grid>
      </Grid>
    </Stack>
  );
}
