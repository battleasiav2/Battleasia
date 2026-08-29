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

/** Home / auth flat card — #161618, white border, gold top bar, square corners. */
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
        border: `1px solid ${alpha('#ffffff', 0.08)}`,
        borderRadius: 0,
        overflow: 'hidden',
        boxShadow: `inset 0 1px 0 ${alpha('#ffffff', 0.04)}`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          bgcolor: accentColor,
          boxShadow: `0 0 10px ${alpha(accentColor, 0.35)}`,
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
  color: USER_COLORS.gold,
};

export const joinArenaCoinTextSx = {
  fontWeight: 800,
  color: USER_COLORS.gold,
  fontSize: 14,
};

export const joinArenaBalanceCoinTextSx = {
  fontWeight: 800,
  color: '#ffffff',
  fontSize: 15,
};
