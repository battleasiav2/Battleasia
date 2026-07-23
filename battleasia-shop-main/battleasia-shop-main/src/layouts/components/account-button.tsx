import type { IconButtonProps } from '@mui/material/IconButton';

import { m } from 'framer-motion';

import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import { alpha } from '@mui/material/styles';

import { varTap, varHover, transitionTap } from 'src/components/animate';
import { USER_COLORS } from 'src/layouts/user/user-theme';

// ----------------------------------------------------------------------

export type AccountButtonProps = IconButtonProps & {
  photoURL: string;
  displayName: string;
};

export function AccountButton({ photoURL, displayName, sx, ...other }: AccountButtonProps) {
  return (
    <IconButton
      component={m.button}
      whileTap={varTap(0.96)}
      whileHover={varHover(1.04)}
      transition={transitionTap()}
      aria-label="Account button"
      sx={[{ p: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
      {...other}
    >
      <Avatar
        src={photoURL}
        alt={displayName}
        sx={{
          width: 40,
          height: 40,
          fontSize: 16,
          fontWeight: 800,
          color: '#111111',
          bgcolor: USER_COLORS.gold,
          border: `2px solid ${alpha(USER_COLORS.gold, 0.85)}`,
          boxShadow: `0 0 20px ${alpha(USER_COLORS.gold, 0.25)}`,
        }}
      >
        {displayName?.charAt(0).toUpperCase()}
      </Avatar>
    </IconButton>
  );
}
