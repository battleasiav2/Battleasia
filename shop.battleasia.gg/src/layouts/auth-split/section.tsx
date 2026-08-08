import type { BoxProps } from '@mui/material/Box';
import type { Breakpoint } from '@mui/material/styles';

import { keyframes } from '@mui/system';
import { Box, Stack, Typography } from '@mui/material';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

export type AuthSplitSectionProps = BoxProps & {
  title?: string;
  imgUrl?: string;
  subtitle?: string;
  layoutQuery?: Breakpoint;
  children?: React.ReactNode;
};

export function AuthSplitSection({
  sx,
  children,
  layoutQuery = 'md',
  title = 'Manage the job',
  imgUrl = `${CONFIG.assetsDir}/assets/illustrations/illustration-dashboard.webp`,
  subtitle = 'More effectively with optimized workflows.',
  ...other
}: AuthSplitSectionProps) {
  const fadeInUpAnimation = keyframes`
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  `;

  return (
    <Box
      sx={[
        (theme) => ({
          // position: 'relative',
          // overflow: 'hidden',
          // bgcolor: '#0a0a0a',
          // width: 1,
          // pt: 'var(--layout-header-desktop-height)',
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'center',
          width: '100%',
          [theme.breakpoints.up(layoutQuery)]: {
            maxWidth: '100%',
            flex: '1 1 100%',
          },
          // Filter background with animation
          // '&::before': {
          //   content: '""',
          //   position: 'absolute',
          //   top: 0,
          //   left: 0,
          //   right: 0,
          //   bottom: 0,
          //   backgroundSize: 'cover',
          //   backgroundPosition: 'left',
          //   backgroundRepeat: 'no-repeat',
          //   // filter: 'blur(2px) brightness(0.3)',
          //   zIndex: 0,
          //   // animation: `${pulseAnimation} 3s ease-in-out infinite`,
          // },
          // Particle animation overlay
          // '&::after': {
          //   content: '""',
          //   position: 'absolute',
          //   top: 0,
          //   left: 0,
          //   right: 0,
          //   bottom: 0,
          //   background: 'radial-gradient(circle at 20% 50%, rgba(255, 140, 0, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 68, 0, 0.15) 0%, transparent 50%)',
          //   zIndex: 1,
          //   animation: `${shimmerAnimation} 4s ease-in-out infinite`,
          // },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Stack
        sx={{
          position: 'relative',
          zIndex: 2,
          width: 1,
          maxWidth: 'var(--layout-auth-content-width)',
          height: { xs: 1, md: 'auto' },
          px: { xs: 2, sm: 3 },
          py: { xs: 2, md: 0 },
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          animation: `${fadeInUpAnimation} 0.8s ease-out`,
        }}
      >
        {children ? (
          <Box
            sx={{
              width: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              maxWidth: 'var(--layout-auth-content-width)',
            }}
          >
            {children}
          </Box>
        ) : (
          <>
            <div>
              <Typography variant="h3" sx={{ textAlign: 'center', color: '#ffffff' }}>
                {title}
              </Typography>

              {subtitle && (
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center', mt: 2 }}>
                  {subtitle}
                </Typography>
              )}
            </div>

            <Box
              component="img"
              alt="Dashboard illustration"
              src={imgUrl}
              sx={{ width: 1, aspectRatio: '4/3', objectFit: 'cover', borderRadius: 2 }}
            />

          </>
        )}
      </Stack>
    </Box>
  );
}
