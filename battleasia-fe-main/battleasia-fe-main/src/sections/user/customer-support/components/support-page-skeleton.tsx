import { Box, Skeleton, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { GLASS_CARD_RADIUS, getDefaultGlassTokens, getGlassShellSx } from 'src/components/battle-glass-card';

// ----------------------------------------------------------------------

export function SupportPageSkeleton() {
  const tokens = getDefaultGlassTokens();

  return (
    <Stack spacing={3}>
      <Box sx={getGlassShellSx(tokens, { height: 120, p: 0, overflow: 'hidden' })}>
        <Skeleton variant="rectangular" width="100%" height="100%" sx={{ bgcolor: alpha('#ffffff', 0.04) }} />
      </Box>

      <Skeleton width="40%" sx={{ bgcolor: alpha('#ffffff', 0.06) }} />

      <Box sx={getGlassShellSx(tokens, { p: 0, overflow: 'hidden', minHeight: 480 })}>
        <Skeleton variant="rectangular" height={72} sx={{ bgcolor: alpha('#ffffff', 0.04) }} />
        <Stack spacing={1.5} sx={{ p: 3 }}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton
              key={index}
              variant="rounded"
              height={64}
              width={index % 2 === 0 ? '70%' : '55%'}
              sx={{ alignSelf: index % 2 === 0 ? 'flex-start' : 'flex-end', bgcolor: alpha('#ffffff', 0.04) }}
            />
          ))}
        </Stack>
        <Skeleton variant="rectangular" height={72} sx={{ bgcolor: alpha('#ffffff', 0.04) }} />
      </Box>
    </Stack>
  );
}
