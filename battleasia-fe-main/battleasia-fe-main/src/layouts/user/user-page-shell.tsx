import type { ReactNode } from 'react';
import type { SxProps, Theme } from '@mui/material/styles';

import Box from '@mui/material/Box';
import { m, useReducedMotion } from 'framer-motion';

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
  const reduceMotion = useReducedMotion();

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
        <Box
          component={reduceMotion ? 'div' : m.div}
          initial={reduceMotion ? undefined : { opacity: 0, y: 18 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={
            reduceMotion ? undefined : { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
          }
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: '1 1 auto',
            width: '100%',
          }}
        >
          {children}
        </Box>
      </DashboardContent>
    </Box>
  );
}
