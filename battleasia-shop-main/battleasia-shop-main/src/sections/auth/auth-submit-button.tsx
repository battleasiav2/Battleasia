import LoadingButton from '@mui/lab/LoadingButton';
import type { LoadingButtonProps } from '@mui/lab/LoadingButton';

import { authSubmitButtonSx } from './auth-form-styles';

// ----------------------------------------------------------------------

export function AuthSubmitButton({ sx, ...other }: LoadingButtonProps) {
  return (
    <LoadingButton
      fullWidth
      size="large"
      type="submit"
      variant="contained"
      sx={[authSubmitButtonSx, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
      {...other}
    />
  );
}
