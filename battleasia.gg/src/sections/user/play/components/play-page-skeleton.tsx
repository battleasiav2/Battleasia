import { Box, Grid2 as Grid, Skeleton, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { GLASS_CARD_RADIUS, getDefaultGlassTokens, getGlassShellSx } from 'src/components/battle-glass-card';

// ----------------------------------------------------------------------

export function PlayPageSkeleton() {
  const tokens = getDefaultGlassTokens();

  return (
    <Stack spacing={3}>
      <Box
        sx={getGlassShellSx(tokens, {
          height: { xs: 300, md: 420 },
          p: 0,
        })}
      >
        <Skeleton variant="rectangular" width="100%" height="100%" sx={{ bgcolor: alpha('#ffffff', 0.04) }} />
      </Box>

      <Grid container spacing={2}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6 }}>
            <Box
              sx={getGlassShellSx(tokens, {
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                minHeight: 148,
                p: 0,
                overflow: 'hidden',
              })}
            >
              <Skeleton
                variant="rectangular"
                sx={{
                  flex: { sm: '0 0 42%' },
                  minHeight: { xs: 160, sm: 148 },
                  bgcolor: alpha('#ffffff', 0.04),
                }}
              />
              <Stack spacing={1.5} sx={{ flex: 1, p: 2.25 }}>
                <Skeleton width="70%" sx={{ borderRadius: `${GLASS_CARD_RADIUS}px` }} />
                <Skeleton width="45%" sx={{ borderRadius: `${GLASS_CARD_RADIUS}px` }} />
                <Skeleton width="90%" sx={{ borderRadius: `${GLASS_CARD_RADIUS}px` }} />
              </Stack>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
