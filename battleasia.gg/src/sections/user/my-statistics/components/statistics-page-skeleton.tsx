import { Box, Skeleton, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { goldAlpha, USER_COLORS } from 'src/layouts/user';

// ----------------------------------------------------------------------

const GOLD = USER_COLORS.gold;

export function StatisticsPageSkeleton() {
  return (
    <Stack spacing={2.5}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          border: `1px solid ${goldAlpha(0.28)}`,
          borderTop: `2px solid ${GOLD}`,
          bgcolor: alpha('#06090e', 0.72),
        }}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <Box key={index} sx={{ p: 2, borderRight: index < 3 ? `1px solid ${alpha('#ffffff', 0.08)}` : 'none' }}>
            <Skeleton width="50%" height={12} sx={{ bgcolor: alpha('#ffffff', 0.06), mb: 1 }} />
            <Skeleton width="70%" height={24} sx={{ bgcolor: alpha('#ffffff', 0.06) }} />
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          border: `1px solid ${goldAlpha(0.28)}`,
          borderTop: `2px solid ${GOLD}`,
          bgcolor: alpha('#06090e', 0.72),
          overflow: 'hidden',
        }}
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <Box
            key={index}
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: index < 5 ? `1px solid ${alpha('#ffffff', 0.08)}` : 'none',
            }}
          >
            <Skeleton width="45%" height={16} sx={{ bgcolor: alpha('#ffffff', 0.06), mb: 0.75 }} />
            <Skeleton width="28%" height={12} sx={{ bgcolor: alpha('#ffffff', 0.04) }} />
          </Box>
        ))}
      </Box>
    </Stack>
  );
}
