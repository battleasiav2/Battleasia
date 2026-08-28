import type { ReactNode } from 'react';
import type { SxProps, Theme } from '@mui/material/styles';

import LoadingButton from '@mui/lab/LoadingButton';

import { Iconify } from 'src/components/iconify/iconify';

import { authSubmitButtonSx } from './auth-form-styles';

// ----------------------------------------------------------------------

type AuthSubmitButtonProps = {
  children: ReactNode;
  loading?: boolean;
  loadingIndicator?: ReactNode;
  type?: 'submit' | 'button';
  onClick?: () => void;
  disabled?: boolean;
  sx?: SxProps<Theme>;
  startIcon?: ReactNode | false;
  endIcon?: ReactNode;
};

export function AuthSubmitButton({
  children,
  loading,
  loadingIndicator: _loadingIndicator,
  type = 'submit',
  onClick,
  disabled,
  sx,
  startIcon,
  endIcon,
}: AuthSubmitButtonProps) {
  const resolvedStartIcon =
    startIcon === false
      ? undefined
      : startIcon ?? <Iconify icon="game-icons:crossed-swords" width={16} />;

  return (
    <LoadingButton
      fullWidth
      size="medium"
      type={type}
      variant="contained"
      disableElevation
      loading={loading}
      loadingPosition="start"
      disabled={disabled}
      onClick={onClick}
      startIcon={resolvedStartIcon}
      endIcon={endIcon}
      sx={[
        authSubmitButtonSx,
        {
          overflow: 'hidden',
          '& .MuiButton-startIcon': { m: 0, mr: resolvedStartIcon ? 1 : 0 },
          '& .MuiButton-endIcon': { m: 0, ml: endIcon ? 0.75 : 0 },
          '& .MuiLoadingButton-loadingIndicatorCenter': { display: 'none' },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {children}
    </LoadingButton>
  );
}
