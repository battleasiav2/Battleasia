import { Box, Grid2 as Grid, Skeleton, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { GLASS_CARD_RADIUS, getGoldTopLineShellSx } from 'src/components/battle-glass-card';

// ----------------------------------------------------------------------

type FeedPageSkeletonProps = {
  hideStats?: boolean;
};

export function FeedPageSkeleton({ hideStats = false }: FeedPageSkeletonProps) {
  return (
    <Stack spacing={3}>
      {!hideStats ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 1.5 }}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Box key={index} sx={getGoldTopLineShellSx({ minHeight: 96, p: 2, pt: 2.5 })}>
              <Skeleton width="55%" sx={{ bgcolor: alpha('#ffffff', 0.06) }} />
              <Skeleton width="35%" sx={{ mt: 1, bgcolor: alpha('#ffffff', 0.04) }} />
            </Box>
          ))}
        </Box>
      ) : null}

      <Skeleton
        variant="rounded"
        height={48}
        sx={{ borderRadius: `${GLASS_CARD_RADIUS}px`, bgcolor: alpha('#ffffff', 0.04) }}
      />

      <Grid container spacing={2}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, lg: 4 }}>
            <Box sx={getGoldTopLineShellSx({ p: 0, overflow: 'hidden' })}>
              <Skeleton variant="rectangular" height={180} sx={{ bgcolor: alpha('#ffffff', 0.04) }} />
              <Stack spacing={1} sx={{ p: 2 }}>
                <Skeleton width="40%" sx={{ bgcolor: alpha('#ffffff', 0.06) }} />
                <Skeleton width="85%" sx={{ bgcolor: alpha('#ffffff', 0.06) }} />
                <Skeleton width="70%" sx={{ bgcolor: alpha('#ffffff', 0.04) }} />
              </Stack>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
