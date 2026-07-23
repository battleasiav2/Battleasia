import type { NavSectionProps } from 'src/components/nav-section';
import type { Theme, SxProps, CSSObject, Breakpoint } from '@mui/material/styles';

import { varAlpha, mergeClasses } from 'minimal-shared/utils';

import { styled, alpha } from '@mui/material/styles';
import { Box, Stack, Typography, Divider } from '@mui/material';

import { Logo } from 'src/components/logo';
import { Scrollbar } from 'src/components/scrollbar';
import { NavSectionMini, NavSectionVertical } from 'src/components/nav-section';
import { GLASS_CARD_RADIUS } from 'src/components/battle-glass-card';

import { useTranslate } from 'src/locales/use-locales';

import { layoutClasses } from '../core/classes';
import { NavToggleButton } from '../components/nav-toggle-button';
import { USER_COLORS } from './user-theme';

// ----------------------------------------------------------------------

export type UserNavVerticalProps = React.ComponentProps<'div'> & {
  isNavMini: boolean;
  sx?: SxProps<Theme>;
  cssVars?: CSSObject;
  layoutQuery?: Breakpoint;
  onToggleNav: () => void;
  data: NavSectionProps['data'];
};

export function UserNavVertical({
  sx,
  data,
  className,
  isNavMini,
  onToggleNav,
  cssVars,
  layoutQuery = 'lg',
  ...other
}: UserNavVerticalProps) {
  const { t, currentLang } = useTranslate();
  const isBengali = currentLang?.value === 'bn';

  const renderBrand = () => (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.25}
      sx={{
        px: 2,
        pt: 2.5,
        pb: 1.5,
      }}
    >
      <Logo
        sx={{
          width: { xs: 64, md: 72 },
          height: { xs: 64, md: 72 },
          flexShrink: 0,
          '& img': {
            borderRadius: `${GLASS_CARD_RADIUS}px`,
            width: 1,
            height: 1,
            objectFit: 'contain',
          },
        }}
      />
      <Box sx={{ minWidth: 0 }}>
        <Typography
          className="font-tr"
          sx={{
            fontSize: isBengali ? 24 : 28,
            color: USER_COLORS.gold,
            fontWeight: 700,
            lineHeight: 1.05,
          }}
        >
          {t('common.brandName')}
        </Typography>
        <Typography
          sx={{
            mt: 0.25,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 1.4,
            textTransform: 'uppercase',
            color: alpha('#ffffff', 0.45),
          }}
        >
          {t('common.brandTagline')}
        </Typography>
      </Box>
    </Stack>
  );

  const renderNavVertical = () => (
    <>
      {renderBrand()}

      <Divider sx={{ mx: 2, borderColor: alpha('#ffffff', 0.08) }} />

      <Scrollbar fillContent>
        <NavSectionVertical data={data} cssVars={cssVars} sx={{ px: 1.5, py: 1.5, flex: '1 1 auto' }} />
      </Scrollbar>

      <Box
        sx={{
          mx: 2,
          mb: 2,
          p: 1.5,
          borderRadius: `${GLASS_CARD_RADIUS}px`,
          bgcolor: alpha('#000000', 0.42),
          border: `1px solid ${alpha(USER_COLORS.gold, 0.18)}`,
        }}
      >
        <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: USER_COLORS.gold, textTransform: 'uppercase' }}>
          Battle Asia
        </Typography>
        <Typography sx={{ mt: 0.5, fontSize: 11, color: alpha('#ffffff', 0.5), lineHeight: 1.45 }}>
          Premium esports arena
        </Typography>
      </Box>
    </>
  );

  const renderNavMini = () => (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2.5 }}>
        <Logo sx={{ width: 44, height: 44 }} />
      </Box>

      <NavSectionMini
        data={data}
        cssVars={cssVars}
        sx={[
          (theme) => ({
            ...theme.mixins.hideScrollY,
            pb: 2,
            px: 0.5,
            flex: '1 1 auto',
            overflowY: 'auto',
          }),
        ]}
      />
    </>
  );

  return (
    <NavRoot
      isNavMini={isNavMini}
      layoutQuery={layoutQuery}
      className={mergeClasses([layoutClasses.nav.root, layoutClasses.nav.vertical, className])}
      sx={sx}
      {...other}
    >
      <NavToggleButton
        isNavMini={isNavMini}
        onClick={onToggleNav}
        sx={[
          (theme) => ({
            display: 'none',
            [theme.breakpoints.up(layoutQuery)]: { display: 'inline-flex' },
          }),
        ]}
      />
      {isNavMini ? renderNavMini() : renderNavVertical()}
    </NavRoot>
  );
}

// ----------------------------------------------------------------------

const NavRoot = styled('div', {
  shouldForwardProp: (prop: string) => !['isNavMini', 'layoutQuery', 'sx'].includes(prop),
})<Pick<UserNavVerticalProps, 'isNavMini' | 'layoutQuery'>>(
  ({ isNavMini, layoutQuery = 'lg', theme }) => ({
    top: 0,
    left: 0,
    height: '100%',
    display: 'none',
    position: 'fixed',
    flexDirection: 'column',
    zIndex: 'var(--layout-nav-zIndex)',
    backgroundColor: 'var(--layout-nav-bg)',
    width: isNavMini ? 'var(--layout-nav-mini-width)' : 'var(--layout-nav-vertical-width)',
    borderRight: `1px solid var(--layout-nav-border-color, ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)})`,
    transition: theme.transitions.create(['width'], {
      easing: 'var(--layout-transition-easing)',
      duration: 'var(--layout-transition-duration)',
    }),
    [theme.breakpoints.up(layoutQuery)]: { display: 'flex' },
  })
);
