import { Box, Skeleton, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { GLASS_CARD_RADIUS, getDefaultGlassTokens, getGlassShellSx } from 'src/components/battle-glass-card';

// ----------------------------------------------------------------------

export function OrdersPageSkeleton() {
  const tokens = getDefaultGlassTokens();

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 1.5,
        }}
      >
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton
            key={i}
            variant="rounded"
            height={96}
            sx={{ borderRadius: `${GLASS_CARD_RADIUS}px`, bgcolor: alpha('#ffffff', 0.04) }}
          />
        ))}
      </Box>

      <Skeleton variant="rounded" height={44} sx={{ borderRadius: `${GLASS_CARD_RADIUS}px`, bgcolor: alpha('#ffffff', 0.04) }} />

      <Stack spacing={2}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Box key={i} sx={getGlassShellSx(tokens, { p: 2 })}>
            <Skeleton variant="rounded" height={140} sx={{ bgcolor: alpha('#ffffff', 0.04) }} />
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}
