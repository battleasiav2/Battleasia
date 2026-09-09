import type { ReactNode } from 'react';
import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';
import { keyframes } from '@mui/material/styles';

import { DashboardContent } from 'src/layouts/dashboard';
import { goldAlpha } from 'src/theme/accent-presets';

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

const laserConduit = keyframes`
  0% { transform: translateX(-100%); }
  50% { transform: translateX(100%); }
  100% { transform: translateX(100%); }
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
      {/* Top Cyber Laser Conduit */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          overflow: 'hidden',
          zIndex: 10,
          pointerEvents: 'none',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(90deg, transparent 0%, ${goldAlpha(0.2)} 20%, ${goldAlpha(0.5)} 50%, ${goldAlpha(0.2)} 80%, transparent 100%)`,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '40%',
            height: '100%',
            background: `linear-gradient(90deg, transparent, ${USER_COLORS.gold}, #ffffff, ${USER_COLORS.gold}, transparent)`,
            animation: `${laserConduit} 4.5s cubic-bezier(0.4, 0, 0.2, 1) infinite`,
            filter: `drop-shadow(0 0 6px ${USER_COLORS.gold})`,
          },
        }}
      />

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
