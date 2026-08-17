import type { BoxProps } from '@mui/material/Box';
import type { Breakpoint } from '@mui/material/styles';

import { keyframes } from '@mui/system';
import { Box, Stack } from '@mui/material';

// ----------------------------------------------------------------------

const fadeInUpAnimation = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export type AuthSplitSectionProps = BoxProps & {
  layoutQuery?: Breakpoint;
  children?: React.ReactNode;
};

export function AuthSplitSection({
  sx,
  children,
  layoutQuery = 'md',
  ...other
}: AuthSplitSectionProps) {
  return (
    <Box
      sx={[
        (theme) => ({
          [theme.breakpoints.up(layoutQuery)]: {
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            justifyContent: 'center',
            maxWidth: '50%',
            flex: '0 0 50%',
          },
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
          maxWidth: 'var(--layout-auth-content-width, 620px)',
          minHeight: { xs: 'auto', md: 'auto' },
          mx: 'auto',
          px: { xs: 2, sm: 3 },
          pt: { xs: 2, sm: 3, md: 3 },
          pb: { xs: 2, md: 3 },
          alignItems: 'center',
          justifyContent: 'center',
          animation: `${fadeInUpAnimation} 0.28s ease-out`,
          '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
        }}
      >
        {children && (
          <Box
            sx={{
              width: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: { xs: 'center', [layoutQuery]: 'flex-end' },
              pr: { [layoutQuery]: 5 },
            }}
          >
            {children}
          </Box>
        )}
      </Stack>
    </Box>
  );
}
