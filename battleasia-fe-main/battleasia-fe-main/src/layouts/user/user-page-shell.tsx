import type { ReactNode } from 'react';
import type { SxProps, Theme } from '@mui/material/styles';

import Box from '@mui/material/Box';

import { DashboardContent } from 'src/layouts/dashboard';

import { USER_COLORS, getUserPageShellOverlays } from './user-theme';

// ----------------------------------------------------------------------

type UserPageShellProps = {
  children: ReactNode;
  disablePadding?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | false;
  sx?: SxProps<Theme>;
  contentSx?: SxProps<Theme>;
};

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
          pt: disablePadding ? 0 : { xs: 12, sm: 14, md: 16 },
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
        {children}
      </DashboardContent>
    </Box>
  );
}
