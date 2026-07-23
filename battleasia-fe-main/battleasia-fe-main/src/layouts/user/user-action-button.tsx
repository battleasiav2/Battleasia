import type { ButtonProps } from '@mui/material/Button';
import type { SxProps, Theme } from '@mui/material/styles';

import Button from '@mui/material/Button';

import {
  userGhostButtonSx,
  userGoldButtonSx,
  userMeshButtonSx,
} from './user-theme';

// ----------------------------------------------------------------------

type UserActionButtonVariant = 'gold' | 'mesh' | 'ghost';

type UserActionButtonProps = Omit<ButtonProps, 'sx'> & {
  actionVariant?: UserActionButtonVariant;
  sx?: SxProps<Theme>;
  href?: string;
  target?: string;
  rel?: string;
};

const VARIANT_SX = {
  gold: userGoldButtonSx,
  mesh: userMeshButtonSx,
  ghost: userGhostButtonSx,
} as const;

export function UserActionButton({
  actionVariant = 'gold',
  sx,
  ...other
}: UserActionButtonProps) {
  const variantSx = VARIANT_SX[actionVariant];
  const mergedSx: SxProps<Theme> = sx
    ? [variantSx, ...(Array.isArray(sx) ? sx : [sx])]
    : variantSx;

  return (
    <Button
      sx={mergedSx}
      {...other}
    />
  );
}
