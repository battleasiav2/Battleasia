import type { BoxProps } from '@mui/material/Box';

import Box from '@mui/material/Box';

import { getGoldDividerSx, type GoldDividerVariant } from './gold-divider-styles';

// ----------------------------------------------------------------------

type BattleGoldDividerProps = BoxProps & {
  variant?: GoldDividerVariant;
  showCenterGem?: boolean;
};

export function BattleGoldDivider({
  variant = 'title',
  showCenterGem,
  sx,
  ...other
}: BattleGoldDividerProps) {
  return (
    <Box
      component="span"
      aria-hidden
      sx={[
        getGoldDividerSx({ variant, showCenterGem }),
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
      {...other}
    />
  );
}
