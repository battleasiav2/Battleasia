import type { ReactNode } from 'react';
import type { Theme, SxProps } from '@mui/material/styles';

import LoadingButton from '@mui/lab/LoadingButton';

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
  type = 'submit',
  onClick,
  disabled,
  sx,
  startIcon,
  endIcon,
}: AuthSubmitButtonProps) {
  const resolvedStartIcon = startIcon === false ? undefined : startIcon || undefined;

  return (
    <LoadingButton
      fullWidth
      size="medium"
      type={type}
      variant="contained"
      color="inherit"
      disableElevation
      disableRipple
      loading={loading}
      loadingPosition="center"
      disabled={disabled}
      onClick={onClick}
      startIcon={resolvedStartIcon}
      endIcon={endIcon}
      sx={[
        authSubmitButtonSx,
        {
          overflow: 'hidden',
          '& .MuiButton-startIcon, & .MuiButton-endIcon, & .MuiLoadingButton-loadingIndicator': {
            m: 0,
            color: 'inherit',
            position: 'relative',
            zIndex: 2,
          },
          '& .MuiButton-startIcon': { mr: resolvedStartIcon ? 1 : 0 },
          '& .MuiButton-endIcon': { ml: endIcon ? 0.75 : 0 },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {children}
    </LoadingButton>
  );
}
