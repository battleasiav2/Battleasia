import type { LinkProps } from '@mui/material/Link';

import { memo, forwardRef } from 'react';
import { mergeClasses } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import { styled } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

import { CONFIG } from 'src/global-config';

import { logoClasses } from './classes';

// ----------------------------------------------------------------------

/** Same asset as nixbazar.com — public/logo/logo.webp */
const LOGO_SRC = `${CONFIG.assetsDir}/logo/logo.webp`;

export type LogoProps = LinkProps & {
  isSingle?: boolean;
  disabled?: boolean;
};

const LogoComponent = forwardRef<HTMLAnchorElement, LogoProps>((props, ref) => {
  const { className, href = '/', isSingle = true, disabled, sx, ...other } = props;

  return (
    <LogoRoot
      ref={ref}
      component={RouterLink}
      href={href}
      aria-label="BattleAsia logo"
      underline="none"
      className={mergeClasses([logoClasses.root, className])}
      sx={[
        () => ({
          width: 40,
          height: 40,
          overflow: 'visible',
          ...(!isSingle && { width: 102, height: 36 }),
          ...(disabled && { pointerEvents: 'none' }),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Box
        component="img"
        alt="BattleAsia"
        src={LOGO_SRC}
        width={64}
        height={64}
        loading="eager"
        decoding="async"
        sx={{
          width: 1,
          height: 1,
          aspectRatio: '1 / 1',
          objectFit: 'contain',
          objectPosition: 'center',
          display: 'block',
        }}
      />
    </LogoRoot>
  );
});

export const Logo = memo(LogoComponent);

// ----------------------------------------------------------------------

const LogoRoot = styled(Link)(() => ({
  flexShrink: 0,
  color: 'transparent',
  display: 'inline-flex',
  verticalAlign: 'middle',
}));
