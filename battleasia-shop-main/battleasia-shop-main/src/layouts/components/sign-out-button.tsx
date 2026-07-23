import type { ButtonProps } from '@mui/material/Button';

import { useCallback } from 'react';

import Button from '@mui/material/Button';

import { dispatch } from 'src/store';
import { logoutAction } from 'src/store/reducers/auth';

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

  return (
    <Button
      fullWidth
      variant="contained"
      size="large"
      color="error"
      onClick={handleLogout}
      sx={sx}
      {...other}
    >
      Logout
    </Button>
  );
}
