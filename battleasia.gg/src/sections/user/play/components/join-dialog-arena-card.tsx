import type { ReactNode } from 'react';

import { Box, type SxProps, type Theme } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { USER_COLORS } from 'src/layouts/user/user-theme';

// ----------------------------------------------------------------------

export const JOIN_ARENA_CARD_BG = '#161618';

type JoinArenaCardProps = {
  children: ReactNode;
  accent?: 'gold' | 'success' | 'error';
  sx?: SxProps<Theme>;
};

/** Zip glass card — #161618 panel, white hairline, 18px radius. */
export function JoinArenaCard({ children, accent = 'gold', sx }: JoinArenaCardProps) {
  const accentColor =
    accent === 'success'
      ? USER_COLORS.success
      : accent === 'error'
        ? USER_COLORS.error
        : USER_COLORS.gold;

  return (
    <Box
      sx={{
        position: 'relative',
        bgcolor: JOIN_ARENA_CARD_BG,
        border: `1px solid ${alpha('#ffffff', 0.09)}`,
        borderRadius: '18px',
        overflow: 'hidden',
        boxShadow: `inset 0 1px 0 ${alpha('#ffffff', 0.05)}`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          bgcolor: accentColor,
          pointerEvents: 'none',
        },
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

export const joinArenaLabelSx = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: 0.8,
  textTransform: 'uppercase' as const,
  color: '#ffffff',
};

export const joinArenaValueSx = {
  fontSize: 14,
  fontWeight: 800,
  color: '#ffffff',
};

export const joinArenaCoinTextSx = {
  fontWeight: 800,
  color: '#ffffff',
  fontSize: 14,
};

export const joinArenaBalanceCoinTextSx = {
  fontWeight: 800,
  color: '#ffffff',
  fontSize: 15,
};
