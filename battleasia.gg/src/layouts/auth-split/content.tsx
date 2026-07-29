import type { BoxProps } from '@mui/material/Box';
import type { Breakpoint } from '@mui/material/styles';

import { mergeClasses } from 'minimal-shared/utils';

import Box from '@mui/material/Box';

import { layoutClasses } from '../core/classes';

// ----------------------------------------------------------------------

export type AuthSplitContentProps = BoxProps & { layoutQuery?: Breakpoint };

export function AuthSplitContent({
  sx,
  children,
  className,
  layoutQuery = 'md',
  ...other
}: AuthSplitContentProps) {
  return (
    <Box
      className={mergeClasses([layoutClasses.content, className])}
      sx={[
        (theme) => ({
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flex: '1 1 auto',
          alignItems: 'center',
          flexDirection: 'column',
          p: theme.spacing(3, 2, 10, 2),
          [theme.breakpoints.up(layoutQuery)]: {
            justifyContent: 'center',
            p: theme.spacing(10, 2, 10, 2),
            maxWidth: '50%',
            flex: '0 0 50%',
          },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {children && (
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            width: 1,
            display: 'flex',
            flexDirection: 'column',
            maxWidth: 'var(--layout-auth-content-width)',
          }}
        >
          {children}
        </Box>
      )}
    </Box>
  );
}
