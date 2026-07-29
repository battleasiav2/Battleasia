import type { SxProps, Theme } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

import { getDefaultGlassTokens, getGlassInnerSx } from 'src/components/battle-glass-card';

import { USER_COLORS } from 'src/layouts/user';

// ----------------------------------------------------------------------

type MatchStatPillProps = {
  label: string;
  children: React.ReactNode;
  minHeight?: number;
  sx?: SxProps<Theme>;
};

export function MatchStatPill({ label, children, minHeight = 64, sx }: MatchStatPillProps) {
  const tokens = getDefaultGlassTokens();

  return (
    <Box sx={getGlassInnerSx(tokens, { p: 1.25, minHeight, ...((sx as object) || {}) })}>
      <Typography
        sx={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: 0.7,
          color: USER_COLORS.textMuted,
          textTransform: 'uppercase',
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
      <Box sx={{ fontSize: 13, fontWeight: 700, color: USER_COLORS.textPrimary }}>{children}</Box>
    </Box>
  );
}
