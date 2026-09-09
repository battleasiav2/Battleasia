import type { ButtonBaseProps } from '@mui/material/ButtonBase';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useTranslate } from 'src/locales/use-locales';
import { Iconify } from 'src/components/iconify';

import { headerSignInButtonSx } from './header-chrome';

// ----------------------------------------------------------------------

export type SignInIconButtonProps = ButtonBaseProps;

export function SignInIconButton({ sx, ...other }: SignInIconButtonProps) {
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
      {/* Tactical User Scope Icon */}
      <Box
        sx={{
          position: 'relative',
          display: 'grid',
          placeItems: 'center',
          width: 20,
          height: 20,
          flexShrink: 0,
        }}
      >
        <Iconify icon="solar:user-circle-bold" width={19} sx={{ color: 'inherit' }} />
        {/* Neon Online Status Pip */}
        <Box
          component="span"
          sx={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 5,
            height: 5,
            borderRadius: '50%',
            bgcolor: 'var(--ba-nav-badge-main, #cbfb24)',
            boxShadow: '0 0 6px var(--ba-nav-badge-main, #cbfb24)',
          }}
        />
      </Box>

      {/* Label */}
      <Box
        component="span"
        sx={{
          display: { xs: 'none', sm: 'inline-block' },
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
