import type { Breakpoint } from '@mui/material/styles';
import type { NavSectionProps } from 'src/components/nav-section';

import { merge } from 'es-toolkit';

import { useTheme, alpha } from '@mui/material/styles';
import { iconButtonClasses } from '@mui/material/IconButton';
import { Box, Alert, Stack, Button, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter, usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useSelector } from 'src/store';

import { Logo } from 'src/components/logo';
import { SiteScrollProgress } from 'src/components/animate';
import { useSettingsContext } from 'src/components/settings';
import { userGoldButtonSx } from 'src/layouts/user/user-theme';

import { allLangs, useTranslate } from 'src/locales';
import { layoutClasses } from '../core/classes';
import { NavHorizontal } from './nav-horizontal';
import { MainSection } from '../core/main-section';
import { HeaderSection } from '../core/header-section';
import { FooterSection } from '../core/footer-section';
import { LayoutSection } from '../core/layout-section';
import { AccountDrawer } from '../components/account-drawer';
import { NotificationsDrawer } from '../components/notifications-drawer';
import { LanguagePopover } from '../components/language-popover';
import { navData as dashboardNavData } from '../nav-config-dashboard';
import { dashboardLayoutVars, dashboardNavColorVars } from './css-vars';
import { menuItems, accountMenuItems, createMenuClickHandler } from '../menu-items-config';

import type { MainSectionProps } from '../core/main-section';
import type { HeaderSectionProps } from '../core/header-section';
import type { LayoutSectionProps } from '../core/layout-section';

// ----------------------------------------------------------------------

const GOLD = '#f5c518';

type LayoutBaseProps = Pick<LayoutSectionProps, 'sx' | 'children' | 'cssVars'>;

export type DashboardLayoutProps = LayoutBaseProps & {
  layoutQuery?: Breakpoint;
  slotProps?: {
    header?: HeaderSectionProps;
    nav?: {
      data?: NavSectionProps['data'];
    };
    main?: MainSectionProps;
  };
};

export function DashboardLayout({
  sx,
  cssVars,
  children,
  slotProps,
  layoutQuery = 'lg',
}: DashboardLayoutProps) {
  const theme = useTheme();
  const { t, currentLang } = useTranslate();

  // Bengali language has longer text, so use smaller fonts
  const isBengali = currentLang?.value === 'bn';

  const settings = useSettingsContext();
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn } = useSelector((state) => state.auth);

  const navVars = dashboardNavColorVars(theme, settings.state.navColor, settings.state.navLayout);

  const navData = slotProps?.nav?.data ?? dashboardNavData;

  const isNavMini = settings.state.navLayout === 'mini';
  const isNavHorizontal = settings.state.navLayout === 'horizontal';
  const isNavVertical = isNavMini || settings.state.navLayout === 'vertical';

  // Handle smooth scroll to section
  const handleMenuClick = createMenuClickHandler(pathname, router);

  const renderHeader = () => {
    const headerSlotProps: HeaderSectionProps['slotProps'] = {
      container: {
        maxWidth: false,
        sx: {
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: { xs: 88, md: 108 },
          height: { xs: 88, md: 108 },
          px: { xs: 2, sm: 3, md: 4 },
          py: 0,
          ...(isNavVertical && { px: { [layoutQuery]: 4 } }),
          ...(isNavHorizontal && {
            bgcolor: 'var(--layout-nav-bg)',
            height: { [layoutQuery]: 'var(--layout-nav-horizontal-height)' },
            [`& .${iconButtonClasses.root}`]: { color: 'var(--layout-nav-text-secondary-color)' },
          }),
        },
      },
      centerArea: {
        sx: {
          flex: '1 1 auto',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'visible',
          px: { lg: 2 },
        },
      },
    };

    const navLinkSx = (isActive: boolean) => ({
      textTransform: 'none' as const,
      fontSize: { lg: 15, xl: 16 },
      fontWeight: 600,
      letterSpacing: 0.02,
      color: isActive ? GOLD : alpha('#ffffff', 0.78),
      textDecoration: 'none',
      cursor: 'pointer',
      whiteSpace: 'nowrap' as const,
      lineHeight: 1,
      transition: 'color 0.2s ease',
      '&:hover': { color: GOLD },
    });

    const headerSlots: HeaderSectionProps['slots'] = {
      topArea: (
        <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
          This is an info Alert.
        </Alert>
      ),
      bottomArea: isNavHorizontal ? (
        <NavHorizontal data={navData} layoutQuery={layoutQuery} cssVars={navVars.section} />
      ) : null,
      leftArea: (
        <Stack
          direction="row"
          alignItems="center"
          spacing={{ xs: 1, sm: 1.25 }}
          sx={{ flexShrink: 0, minWidth: 0, height: 1 }}
        >
          <Logo
            sx={{
              width: { xs: 72, sm: 86, md: 100 },
              height: { xs: 72, sm: 86, md: 100 },
              flexShrink: 0,
            }}
          />
          <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
            <Typography
              className="font-brand-gaming"
              sx={{
                fontSize: isBengali
                  ? { xs: 16, sm: 20, md: 24 }
                  : { xs: 18, sm: 22, md: 26 },
                color: GOLD,
                fontWeight: 800,
                lineHeight: 1,
                whiteSpace: 'nowrap',
                background: `linear-gradient(180deg, #ffe08a 0%, ${GOLD} 48%, #d4a017 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: `drop-shadow(0 0 14px ${alpha(GOLD, 0.5)}) drop-shadow(0 2px 6px rgba(0,0,0,0.85))`,
              }}
            >
              BattleAsia
            </Typography>
            <Box
              sx={{
                px: 0.9,
                py: 0.35,
                border: `1.5px solid ${alpha(GOLD, 0.75)}`,
                bgcolor: alpha(GOLD, 0.08),
                display: { xs: 'none', sm: 'inline-flex' },
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography
                className="font-tr"
                sx={{
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: 0.8,
                  color: GOLD,
                  lineHeight: 1.2,
                }}
              >
                2.0
              </Typography>
            </Box>
          </Stack>
        </Stack>
      ),
      centerArea: (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          spacing={{ lg: 3.5, xl: 4.5 }}
          sx={{
            display: { xs: 'none', lg: 'flex' },
            height: 1,
            width: 1,
          }}
        >
          {menuItems.map((item) => {
            const isActive = item.isActive(pathname);
            return (
              <Typography
                key={item.href}
                component={RouterLink}
                href={item.href}
                onClick={(e) => handleMenuClick(e as React.MouseEvent<HTMLAnchorElement>, item)}
                sx={navLinkSx(isActive)}
              >
                {t(item.labelKey)}
              </Typography>
            );
          })}
        </Stack>
      ),
      rightArea: (
        <Stack
          direction="row"
          alignItems="center"
          spacing={{ xs: 0.75, sm: 1.25 }}
          sx={{ flexShrink: 0, height: 1, minWidth: { lg: 140 }, justifyContent: 'flex-end' }}
        >
          {isLoggedIn ? (
            <>
              <NotificationsDrawer />
              <AccountDrawer data={accountMenuItems} />
            </>
          ) : (
            <Button
              component={RouterLink}
              href={paths.auth.signIn}
              sx={{
                ...userGoldButtonSx,
                height: { xs: 36, sm: 40 },
                px: { xs: 1.75, sm: 2.25 },
                fontSize: { xs: 13, sm: 14 },
                fontWeight: 600,
                whiteSpace: 'nowrap',
                minWidth: 'auto',
              }}
            >
              {t('auth.signIn')}
            </Button>
          )}

          <LanguagePopover data={allLangs} />
        </Stack>
      ),
    };

    return (
      <HeaderSection
        disableOffset
        layoutQuery={layoutQuery}
        disableElevation={isNavVertical}
        {...slotProps?.header}
        slots={{ ...headerSlots, ...slotProps?.header?.slots }}
        slotProps={merge(headerSlotProps, slotProps?.header?.slotProps ?? {})}
        sx={{
          bgcolor: alpha('#161618', 0.55),
          backdropFilter: 'blur(0px)',
          WebkitBackdropFilter: 'blur(0px)',
          borderBottom: `2px solid ${alpha('#ffffff', 0.16)}`,
          boxShadow: `
            inset 0 1px 0 ${alpha('#ffffff', 0.04)},
            0 0 0 1px ${alpha(GOLD, 0.2)},
            0 8px 20px ${alpha('#000000', 0.22)}
          `,
          ...slotProps?.header?.sx,
        }}
      />
    );
  };

  const isHomePage = pathname === paths.dashboard.root;

  const renderFooter = () => <FooterSection />;

  const renderMain = () => (
    <MainSection
      {...slotProps?.main}
      sx={[
        isHomePage && { bgcolor: '#000000' },
        ...(Array.isArray(slotProps?.main?.sx)
          ? slotProps.main.sx
          : slotProps?.main?.sx
            ? [slotProps.main.sx]
            : []),
      ]}
    >
      {children}
    </MainSection>
  );

  return (
    <>
      <SiteScrollProgress />
      <LayoutSection
        /** **************************************
         * @Header
         *************************************** */
        headerSection={renderHeader()}
        /** **************************************
         * @Sidebar
         *************************************** */
        // sidebarSection={isNavHorizontal ? null : renderSidebar()}
        /** **************************************
         * @Footer
         *************************************** */
        footerSection={renderFooter()}
        /** **************************************
         * @Styles
         *************************************** */
        cssVars={{
          ...dashboardLayoutVars(theme),
          ...navVars.layout,
          '--layout-header-mobile-height': '88px',
          '--layout-header-desktop-height': '108px',
          ...cssVars,
        }}
        sx={[
          {
            [`& .${layoutClasses.sidebarContainer}`]: {
              [theme.breakpoints.up(layoutQuery)]: {
                pl: isNavMini ? 'var(--layout-nav-mini-width)' : 'var(--layout-nav-vertical-width)',
                transition: theme.transitions.create(['padding-left'], {
                  easing: 'var(--layout-transition-easing)',
                  duration: 'var(--layout-transition-duration)',
                }),
              },
            },
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {renderMain()}
      </LayoutSection>
    </>
  );
}
