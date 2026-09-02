import type { IconButtonProps } from '@mui/material/IconButton';

import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import { alpha } from '@mui/material/styles';

import { USER_COLORS, goldAlpha } from 'src/layouts/user/user-theme';

// ----------------------------------------------------------------------

export type AccountButtonProps = IconButtonProps & {
  photoURL: string;
  displayName: string;
};

/** CSS-only — no framer-motion / AnimateBorder on header critical path */
export function AccountButton({ photoURL, displayName, sx, ...other }: AccountButtonProps) {
  return (
    <IconButton
      aria-label="Account button"
      sx={[
        {
          p: 0,
          transition: 'transform 0.15s ease',
          '&:hover': { transform: 'scale(1.04)' },
          '&:active': { transform: 'scale(0.96)' },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Avatar
        src={photoURL}
        alt={displayName}
        sx={{
          width: { xs: 32, sm: 34 },
          height: { xs: 32, sm: 34 },
          border: `1.5px solid ${goldAlpha(0.65)}`,
          boxShadow: `0 0 0 1px ${goldAlpha(0.2)}`,
        }}
      >
        {displayName?.charAt(0).toUpperCase()}
      </Avatar>
    </IconButton>
  );
}
