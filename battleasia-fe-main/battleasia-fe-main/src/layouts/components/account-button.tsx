import type { IconButtonProps } from '@mui/material/IconButton';

import { m } from 'framer-motion';

import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import { alpha } from '@mui/material/styles';

import { varTap, varHover, AnimateBorder, transitionTap } from 'src/components/animate';

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
      <AnimateBorder
        sx={{ p: '3px', borderRadius: '50%', width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 } }}
        slotProps={{
          primaryBorder: { size: 60, width: '1px', sx: { color: USER_COLORS.gold } },
          secondaryBorder: { sx: { color: alpha(USER_COLORS.gold, 0.45) } },
        }}
      >
        <Avatar src={photoURL} alt={displayName} sx={{ width: 1, height: 1 }}>
          {displayName?.charAt(0).toUpperCase()}
        </Avatar>
      </AnimateBorder>
    </IconButton>
  );
}
