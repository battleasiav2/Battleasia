import type { ButtonProps } from '@mui/material/Button';
import type { SxProps, Theme } from '@mui/material/styles';

import { useCallback } from 'react';

import Button from '@mui/material/Button';

import { dispatch } from 'src/store';
import { logoutAction } from 'src/store/reducers/auth';
import { userLogoutButtonSx } from 'src/layouts/user/user-theme';

// ----------------------------------------------------------------------

type Props = ButtonProps & {
  onClose?: () => void;
};

export function SignOutButton({ onClose, sx, ...other }: Props) {
  const handleLogout = useCallback(async () => {
    try {
      dispatch(logoutAction());
      onClose?.();
    } catch (error) {
      console.error(error);
    }
  }, [onClose]);

  const mergedSx: SxProps<Theme> = sx
    ? [userLogoutButtonSx, ...(Array.isArray(sx) ? sx : [sx])]
    : userLogoutButtonSx;

  return (
    <Button
      fullWidth
      variant="contained"
      size="large"
      onClick={handleLogout}
      sx={mergedSx}
      {...other}
    >
      Logout
    </Button>
  );
}
