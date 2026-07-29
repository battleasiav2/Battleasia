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
      variant="outlined"
      disableElevation
      loading={loading}
      loadingIndicator={loadingIndicator}
      disabled={disabled}
      onClick={onClick}
      startIcon={
        <Iconify icon="game-icons:crossed-swords" width={22} />
      }
      sx={{
        ...authSubmitButtonSx,
        '&.Mui-disabled': {
          bgcolor: 'rgba(0,0,0,0.35)',
          color: 'rgba(245, 197, 24, 0.35)',
          borderColor: 'rgba(245, 197, 24, 0.22)',
        },
      }}
    >
      {children}
    </LoadingButton>
  );
}
