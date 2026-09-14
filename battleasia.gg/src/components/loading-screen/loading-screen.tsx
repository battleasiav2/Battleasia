import type { Theme, SxProps } from '@mui/material/styles';

import { Fragment } from 'react';

import Portal from '@mui/material/Portal';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';

// ----------------------------------------------------------------------

export type LoadingScreenProps = React.ComponentProps<'div'> & {
  portal?: boolean;
  sx?: SxProps<Theme>;
};

export function LoadingScreen({ portal, sx, ...other }: LoadingScreenProps) {
  const PortalWrapper = portal ? Portal : Fragment;

  return (
    <PortalWrapper>
      <LoadingContent sx={sx} {...other}>
        <Box
          sx={{
            position: 'relative',
            width: 72,
            height: 72,
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              inset: -6,
              borderRadius: '50%',
              border: '1px solid rgba(var(--ba-gold-rgb, 203,251,36), 0.28)',
              animation: 'ba-route-glow 1.6s ease-in-out infinite',
              '@keyframes ba-route-glow': {
                '0%, 100%': { opacity: 0.45, transform: 'scale(0.96)' },
                '50%': { opacity: 1, transform: 'scale(1.05)' },
              },
            }}
          />
          <Box
            component="img"
            src="/logo/logo.webp"
            alt=""
            width={56}
            height={56}
            sx={{
              width: 56,
              height: 56,
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 14px rgba(var(--ba-gold-rgb, 203,251,36), 0.35))',
            }}
          />
        </Box>
      </LoadingContent>
    </PortalWrapper>
  );
}

// ----------------------------------------------------------------------

const LoadingContent = styled('div')(() => ({
  flexGrow: 1,
  width: '100%',
  display: 'flex',
  minHeight: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#060607',
}));
