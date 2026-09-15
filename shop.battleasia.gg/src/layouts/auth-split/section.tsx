import type { BoxProps } from '@mui/material/Box';
import type { Breakpoint } from '@mui/material/styles';

import { Box, Stack } from '@mui/material';

// ----------------------------------------------------------------------

export type AuthSplitSectionProps = BoxProps & {
  layoutQuery?: Breakpoint;
  children?: React.ReactNode;
};

/** Zip `.auth-form-col` — centered form column */
export function AuthSplitSection({
  sx,
  children,
  layoutQuery = 'md',
  ...other
}: AuthSplitSectionProps) {
  return (
    <Box
      sx={[
        {
          width: 1,
          minWidth: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Stack
        sx={{
          position: 'relative',
          zIndex: 2,
          width: 1,
          maxWidth: 'var(--layout-auth-content-width, 430px)',
          mx: 'auto',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children && (
          <Box
            sx={{
              width: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {children}
          </Box>
        )}
      </Stack>
    </Box>
  );
}
