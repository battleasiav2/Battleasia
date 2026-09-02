import type { NavSectionProps } from 'src/components/nav-section';
import type { Theme, SxProps, CSSObject, Breakpoint } from '@mui/material/styles';

import { varAlpha, mergeClasses } from 'minimal-shared/utils';

import { styled, alpha } from '@mui/material/styles';
import { Box, Stack, Typography, Divider } from '@mui/material';

import { Logo } from 'src/components/logo';
import { NavSectionMini, NavSectionVertical } from 'src/components/nav-section';
import { GLASS_CARD_RADIUS } from 'src/components/battle-glass-card';

import { useTranslate } from 'src/locales/use-locales';

import { layoutClasses } from '../core/classes';
import { NavToggleButton } from '../components/nav-toggle-button';
import { USER_COLORS } from './user-theme';
import { goldAlpha } from 'src/theme/accent-presets';

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
          width: { xs: 56, md: 64 },
          height: { xs: 56, md: 64 },
          flexShrink: 0,
        }}
      />
      <Box sx={{ minWidth: 0 }}>
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <Typography
            className="font-brand-gaming"
            sx={{
              fontSize: isBengali ? { md: 18, lg: 20 } : { md: 20, lg: 22 },
              fontWeight: 800,
              color: USER_COLORS.gold,
              lineHeight: 1,
              whiteSpace: 'nowrap',
              background: `linear-gradient(180deg, #ffe08a 0%, ${USER_COLORS.gold} 48%, #d4a017 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            BattleAsia
          </Typography>
          <Box
            sx={{
              px: 0.65,
              py: 0.2,
              borderRadius: '3px',
              border: `1px solid ${goldAlpha(0.65)}`,
              bgcolor: goldAlpha(0.08),
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              className="font-tr"
              sx={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 0.6,
                color: USER_COLORS.gold,
                lineHeight: 1.2,
              }}
            >
              2.0
            </Typography>
          </Box>
        </Stack>
        <Typography
          sx={{
            mt: 0.5,
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

      <Box
        sx={(theme) => ({
          flex: '1 1 auto',
          minHeight: 0,
          overflowY: 'auto',
          ...theme.mixins.hideScrollY,
        })}
      >
        <NavSectionVertical data={data} cssVars={cssVars} sx={{ px: 1.5, py: 1.5, flex: '1 1 auto' }} />
      </Box>

      <Box
        sx={{
          mx: 2,
          mb: 2,
          p: 1.5,
          borderRadius: `${GLASS_CARD_RADIUS}px`,
          bgcolor: alpha('#000000', 0.42),
          border: `1px solid ${goldAlpha(0.18)}`,
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
        <Logo sx={{ width: 52, height: 52 }} />
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
