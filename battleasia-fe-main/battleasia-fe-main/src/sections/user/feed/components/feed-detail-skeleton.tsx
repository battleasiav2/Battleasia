import { Box, Skeleton, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { getDefaultGlassTokens, getGlassShellSx } from 'src/components/battle-glass-card';

// ----------------------------------------------------------------------

export function FeedDetailSkeleton() {
  const tokens = getDefaultGlassTokens();

  return (
    <Stack spacing={3}>
      <Skeleton width={120} sx={{ bgcolor: alpha('#ffffff', 0.06) }} />
      <Skeleton width="80%" sx={{ bgcolor: alpha('#ffffff', 0.06) }} />
      <Skeleton width="45%" sx={{ bgcolor: alpha('#ffffff', 0.04) }} />

      <Box sx={getGlassShellSx(tokens, { p: 2, minHeight: 56 })}>
        <Skeleton width="60%" sx={{ bgcolor: alpha('#ffffff', 0.04) }} />
      </Box>

      <Box sx={getGlassShellSx(tokens, { p: 0, overflow: 'hidden' })}>
        <Skeleton variant="rectangular" height={320} sx={{ bgcolor: alpha('#ffffff', 0.04) }} />
      </Box>

      <Box sx={getGlassShellSx(tokens, { p: 3, minHeight: 240 })}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} width={`${90 - index * 8}%`} sx={{ mt: index ? 1.5 : 0, bgcolor: alpha('#ffffff', 0.04) }} />
        ))}
      </Box>
    </Stack>
  );
}
