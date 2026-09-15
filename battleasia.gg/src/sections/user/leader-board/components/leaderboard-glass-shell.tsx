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
        borderRadius: '18px',
        bgcolor: 'rgba(22,22,24,0.38)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${alpha('#ffffff', 0.09)}`,
        boxShadow: '0 30px 80px -44px #000, inset 0 1px 0 rgba(255,255,255,0.05)',
        overflow: 'hidden',
      }}
    >
      {children}
    </Box>
  );
}
