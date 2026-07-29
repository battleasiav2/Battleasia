import Button from '@mui/material/Button';

import { Iconify } from 'src/components/iconify';

import { userGhostButtonSx } from './user-theme';

// ----------------------------------------------------------------------

type UserBackButtonProps = {
  onClick: () => void;
  label?: string;
};

export function UserBackButton({ onClick, label = 'Back' }: UserBackButtonProps) {
  return (
    <Button
      startIcon={<Iconify icon="solar:alt-arrow-left-bold" />}
      onClick={onClick}
      sx={userGhostButtonSx}
    >
      {label}
    </Button>
  );
}
