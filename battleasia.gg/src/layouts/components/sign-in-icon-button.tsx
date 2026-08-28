import type { IconButtonProps } from '@mui/material/IconButton';

import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useTranslate } from 'src/locales/use-locales';
import { Iconify } from 'src/components/iconify';

import { headerSignInIconButtonSx } from './header-chrome';

// ----------------------------------------------------------------------

export type SignInIconButtonProps = IconButtonProps;

export function SignInIconButton({ sx, ...other }: SignInIconButtonProps) {
  const { t } = useTranslate();

  return (
    <IconButton
      component={RouterLink}
      href={paths.auth.signIn}
      aria-label={t('auth.signIn')}
      sx={[headerSignInIconButtonSx, ...(Array.isArray(sx) ? sx : [sx])]}
      {...other}
    >
      <Iconify icon="solar:user-circle-bold" width={24} />
    </IconButton>
  );
}
