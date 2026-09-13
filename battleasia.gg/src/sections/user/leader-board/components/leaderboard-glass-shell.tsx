import type { ReactNode } from 'react';

import { Box } from '@mui/material';
import { alpha } from '@mui/material/styles';

// ----------------------------------------------------------------------

type LeaderboardGlassShellProps = {
  children: ReactNode;
};

export function LeaderboardGlassShell({ children }: LeaderboardGlassShellProps) {
  return (
    <Box
      sx={{
        borderRadius: '12px',
        bgcolor: '#161618',
        border: `1px solid ${alpha('#ffffff', 0.08)}`,
        overflow: 'hidden',
      }}
    >
      {children}
    </Box>
  );
}
