import type { ReactNode } from 'react';
import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';
import { keyframes } from '@mui/material/styles';

import { DashboardContent } from 'src/layouts/dashboard';

import { USER_COLORS, getUserPageShellOverlays } from './user-theme';

// ----------------------------------------------------------------------

const pageEnter = keyframes`
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.996);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

type UserPageShellProps = {
  children: ReactNode;
  disablePadding?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | false;
  sx?: SxProps<Theme>;
  contentSx?: SxProps<Theme>;
};

/** High-tech cyber esports page shell with telemetry overlays and corner brackets */
export function UserPageShell({
  children,
  disablePadding,
  maxWidth = 'lg',
  sx,
  contentSx,
}: UserPageShellProps) {
  const overlays = getUserPageShellOverlays();

  return (
    <Box
      sx={[
        {
          position: 'relative',
          display: 'flex',
          flex: '1 1 auto',
          flexDirection: 'column',
          width: '100%',
          bgcolor: USER_COLORS.pageBg,
          color: USER_COLORS.textBody,
          pt: disablePadding ? 0 : { xs: 6.5, sm: 7, md: 7.5 },
          pb: disablePadding ? 0 : { xs: 12, sm: 12, md: 6 },
          minHeight: '100%',
          overflow: 'clip',
          '&::before': overlays.before,
          '&::after': overlays.after,
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <DashboardContent
        disablePadding
        maxWidth={maxWidth}
        sx={[
          {
            position: 'relative',
            zIndex: 1,
            flex: '1 1 auto',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            px: disablePadding ? 0 : { xs: 2, sm: 3, md: 4 },
            pt: 0,
            pb: 0,
          },
          ...(Array.isArray(contentSx) ? contentSx : contentSx ? [contentSx] : []),
        ]}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: '1 1 auto',
            width: '100%',
            animation: `${pageEnter} 0.5s cubic-bezier(0.22, 1, 0.36, 1) both`,
            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          }}
        >
          {children}
        </Box>
      </DashboardContent>
    </Box>
  );
}
