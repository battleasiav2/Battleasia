import type { ButtonBaseProps } from '@mui/material/ButtonBase';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useTranslate } from 'src/locales/use-locales';
import { Iconify } from 'src/components/iconify';

import { headerSignInButtonSx } from './header-chrome';

// ----------------------------------------------------------------------

export type SignInIconButtonProps = ButtonBaseProps & {
  hideIcon?: boolean;
};

export function SignInIconButton({ sx, hideIcon = false, ...other }: SignInIconButtonProps) {
  const { t } = useTranslate();

  const rawLogin = t('navigation.login');
  const loginLabel =
    !rawLogin || rawLogin === 'navigation.login' ? 'LOGIN' : rawLogin;

  return (
    <ButtonBase
      component={RouterLink}
      href={paths.auth.signIn}
      aria-label={loginLabel}
      sx={[headerSignInButtonSx, ...(Array.isArray(sx) ? sx : [sx])]}
      {...other}
    >
      {!hideIcon && (
        <Iconify icon="solar:user-circle-bold" width={19} sx={{ color: 'inherit' }} />
      )}

      <Box
        component="span"
        sx={{
          display: hideIcon ? 'inline-block' : { xs: 'none', sm: 'inline-block' },
          lineHeight: 1,
          fontWeight: 800,
          letterSpacing: '1.2px',
        }}
      >
        {loginLabel}
      </Box>
    </ButtonBase>
  );
}
