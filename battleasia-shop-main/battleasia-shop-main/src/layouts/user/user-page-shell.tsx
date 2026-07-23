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
          flex: '1 1 auto',
          bgcolor: USER_COLORS.pageBg,
          color: USER_COLORS.textBody,
          pt: { xs: 12, sm: 14, md: 16 },
          pb: { xs: 3, md: 5 },
          overflow: 'hidden',
          minHeight: '100%',
          '&::before': overlays.before,
          '&::after': overlays.after,
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <DashboardContent
        disablePadding={disablePadding}
        maxWidth={maxWidth}
        sx={[
          {
            position: 'relative',
            zIndex: 1,
            px: { xs: 2, sm: 3, md: 4 },
          },
          ...(Array.isArray(contentSx) ? contentSx : contentSx ? [contentSx] : []),
        ]}
      >
        {children}
      </DashboardContent>
    </Box>
  );
}
