import { Box, Skeleton, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { goldAlpha } from 'src/layouts/user';

// ----------------------------------------------------------------------

export function MyMatchesPageSkeleton() {
  return (
    <Stack spacing={2.5}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          border: `1px solid ${goldAlpha(0.2)}`,
          borderTop: `2px solid ${goldAlpha(0.55)}`,
          bgcolor: alpha('#06090e', 0.6),
        }}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <Box key={index} sx={{ p: 2, borderRight: index < 3 ? `1px solid ${alpha('#ffffff', 0.06)}` : 'none' }}>
            <Skeleton width="50%" sx={{ bgcolor: alpha('#ffffff', 0.06) }} />
            <Skeleton width="30%" sx={{ mt: 1, bgcolor: alpha('#ffffff', 0.04) }} />
          </Box>
        ))}
      </Box>

      <Skeleton variant="rectangular" height={44} sx={{ bgcolor: alpha('#ffffff', 0.04) }} />

      <Box
        sx={{
          border: `1px solid ${goldAlpha(0.2)}`,
          borderTop: `2px solid ${goldAlpha(0.55)}`,
          bgcolor: alpha('#06090e', 0.6),
          overflow: 'hidden',
        }}
      >
        {Array.from({ length: 5 }).map((_, index) => (
          <Stack
            key={index}
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: index < 4 ? `1px solid ${alpha('#ffffff', 0.06)}` : 'none',
            }}
          >
            <Skeleton variant="rectangular" width={64} height={64} sx={{ flexShrink: 0, bgcolor: alpha('#ffffff', 0.05) }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton width="55%" sx={{ bgcolor: alpha('#ffffff', 0.06) }} />
              <Skeleton width="40%" sx={{ mt: 0.75, bgcolor: alpha('#ffffff', 0.04) }} />
            </Box>
            <Skeleton width={48} sx={{ display: { xs: 'none', sm: 'block' }, bgcolor: alpha('#ffffff', 0.04) }} />
          </Stack>
        ))}
      </Box>
    </Stack>
  );
}
