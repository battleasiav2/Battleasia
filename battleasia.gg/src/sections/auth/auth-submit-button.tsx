import type { SxProps, Theme } from '@mui/material/styles';

import LoadingButton from '@mui/lab/LoadingButton';

import { Iconify } from 'src/components/iconify/iconify';

import { authSubmitButtonSx } from './auth-form-styles';

// ----------------------------------------------------------------------

type AuthSubmitButtonProps = {
  children: React.ReactNode;
  loading?: boolean;
  loadingIndicator?: React.ReactNode;
  type?: 'submit' | 'button';
  onClick?: () => void;
  disabled?: boolean;
  sx?: SxProps<Theme>;
};

export function AuthSubmitButton({
  children,
  loading,
  loadingIndicator: _loadingIndicator,
  type = 'submit',
  onClick,
  disabled,
  sx,
}: AuthSubmitButtonProps) {
  return (
    <LoadingButton
      fullWidth
      size="large"
      type={type}
      variant="contained"
      disableElevation
      loading={loading}
      loadingPosition="start"
      disabled={disabled}
      onClick={onClick}
      startIcon={<Iconify icon="game-icons:crossed-swords" width={18} />}
      sx={[
        authSubmitButtonSx,
        {
          overflow: 'hidden',
          '& .MuiButton-startIcon': { m: 0, mr: 1 },
          '& .MuiLoadingButton-loadingIndicatorCenter': { display: 'none' },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {children}
    </LoadingButton>
  );
}
