import { Box, Grid2 as Grid, Skeleton, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { GLASS_CARD_RADIUS, getDefaultGlassTokens, getGlassShellSx } from 'src/components/battle-glass-card';

// ----------------------------------------------------------------------

export function MatchPageSkeleton() {
  const tokens = getDefaultGlassTokens();

  return (
    <Stack spacing={3}>
      <Grid container spacing={2}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Grid key={index} size={{ xs: 12, sm: 4 }}>
            <Box sx={getGlassShellSx(tokens, { minHeight: 110, p: 2 })}>
              <Skeleton width="55%" sx={{ bgcolor: alpha('#ffffff', 0.06) }} />
              <Skeleton width="35%" sx={{ mt: 1, bgcolor: alpha('#ffffff', 0.04) }} />
            </Box>
          </Grid>
        ))}
      </Grid>

      <Skeleton
        variant="rounded"
        height={48}
        sx={{ borderRadius: `${GLASS_CARD_RADIUS}px`, bgcolor: alpha('#ffffff', 0.04) }}
      />

      <Grid container spacing={2}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Grid key={index} size={{ xs: 12, lg: 6 }}>
            <Box
              sx={getGlassShellSx(tokens, {
                p: 0,
                overflow: 'hidden',
                height: { xs: 200, sm: 220 },
                display: 'flex',
                flexDirection: 'row',
                borderRadius: '18px',
              })}
            >
              <Skeleton
                variant="rectangular"
                sx={{ width: '40%', height: 1, flexShrink: 0, bgcolor: alpha('#ffffff', 0.04) }}
              />
              <Stack spacing={1} sx={{ p: 1.5, flex: 1, justifyContent: 'space-between' }}>
                <Box>
                  <Skeleton width="85%" sx={{ bgcolor: alpha('#ffffff', 0.06) }} />
                  <Skeleton width="55%" sx={{ mt: 0.75, bgcolor: alpha('#ffffff', 0.04) }} />
                </Box>
                <Skeleton width="100%" height={28} sx={{ bgcolor: alpha('#ffffff', 0.04) }} />
                <Skeleton variant="rounded" height={40} sx={{ bgcolor: alpha('#ffffff', 0.04) }} />
              </Stack>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
