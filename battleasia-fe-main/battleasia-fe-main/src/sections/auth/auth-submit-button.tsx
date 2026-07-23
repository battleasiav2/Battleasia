import LoadingButton from '@mui/lab/LoadingButton';
import { alpha } from '@mui/material/styles';

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
};

export function AuthSubmitButton({
  children,
  loading,
  loadingIndicator,
  type = 'submit',
  onClick,
  disabled,
}: AuthSubmitButtonProps) {
  return (
    <LoadingButton
      fullWidth
      size="large"
      type={type}
      variant="contained"
      loading={loading}
      loadingIndicator={loadingIndicator}
      disabled={disabled}
      onClick={onClick}
      startIcon={
        <Iconify icon="game-icons:crossed-swords" width={22} sx={{ color: '#111111' }} />
      }
      sx={{
        ...authSubmitButtonSx,
        '& .MuiLoadingButton-loadingIndicator': { color: '#111111' },
        '&.Mui-disabled': {
          background: `linear-gradient(180deg, ${alpha('#f59e0b', 0.45)} 0%, ${alpha('#d97706', 0.45)} 100%)`,
          color: alpha('#111111', 0.5),
        },
      }}
    >
      {children}
    </LoadingButton>
  );
}
