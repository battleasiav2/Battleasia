import type { Breakpoint } from '@mui/material/styles';
import type { NavSectionProps } from 'src/components/nav-section';

import { useEffect, useState, lazy, Suspense } from 'react';
import { merge } from 'es-toolkit';

import { useTheme, alpha } from '@mui/material/styles';
import { iconButtonClasses } from '@mui/material/IconButton';
import { Box, Alert, Stack, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter, usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useSelector } from 'src/store';

import { Logo } from 'src/components/logo';
import { useSettingsContext } from 'src/components/settings';

import { allLangs, useTranslate } from 'src/locales';
import { layoutClasses } from '../core/classes';
import { NavHorizontal } from './nav-horizontal';
import { MainSection } from '../core/main-section';
import { HeaderSection } from '../core/header-section';
import { FooterSection } from '../core/footer-section';
import { LayoutSection } from '../core/layout-section';
import { LanguagePopover } from '../components/language-popover';
import { SignInIconButton } from '../components/sign-in-icon-button';
import {
  headerBarSx,
  headerContainerSx,
  headerCenterAreaSx,
  headerLeftAreaSx,
  headerRightAreaSx,
  getHeaderNavLinkSx,
} from '../components/header-chrome';
import { navData as dashboardNavData } from '../nav-config-dashboard';
import { dashboardLayoutVars, dashboardNavColorVars } from './css-vars';
import { PublicMobileNav } from '../components/public-mobile-nav';
import { menuItems, accountMenuItems, createMenuClickHandler } from '../menu-items-config';

import type { MainSectionProps } from '../core/main-section';
import type { HeaderSectionProps } from '../core/header-section';
import type { LayoutSectionProps } from '../core/layout-section';

// Logged-in chrome — keep simplebar / drawer JS off anonymous home LCP
const AccountDrawer = lazy(() =>
  import('../components/account-drawer').then((m) => ({ default: m.AccountDrawer }))
);
const NotificationsDrawer = lazy(() =>
  import('../components/notifications-drawer').then((m) => ({ default: m.NotificationsDrawer }))
);

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
          justifyContent: { xs: 'space-between', lg: 'stretch' },
          ...headerContainerSx,
          ...(isNavVertical && { px: { [layoutQuery]: 3 } }),
          ...(isNavHorizontal && {
            bgcolor: 'var(--layout-nav-bg)',
            height: { [layoutQuery]: 'var(--layout-nav-horizontal-height)' },
            [`& .${iconButtonClasses.root}`]: { color: 'var(--layout-nav-text-secondary-color)' },
          }),
        },
      },
      centerArea: {
        sx: headerCenterAreaSx,
      },
    };

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
          spacing={{ xs: 0.75, sm: 1 }}
          sx={{ ...headerLeftAreaSx, flexShrink: 0, minWidth: 0, height: 1 }}
        >
          <Logo
            sx={{
              width: { xs: 40, sm: 44, md: 46 },
              height: { xs: 40, sm: 44, md: 46 },
              flexShrink: 0,
            }}
          />
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 0 }}>
            <Typography
              className="font-brand-gaming"
              sx={{
                fontSize: isBengali
                  ? { xs: 13, sm: 14, md: 16 }
                  : { xs: 14, sm: 15, md: 17 },
                color: GOLD,
                fontWeight: 800,
                lineHeight: 1,
                whiteSpace: 'nowrap',
                background: `linear-gradient(180deg, #ffe08a 0%, ${GOLD} 48%, #d4a017 100%)`,
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
                border: `1px solid ${alpha(GOLD, 0.65)}`,
                bgcolor: alpha(GOLD, 0.08),
                display: { xs: 'none', sm: 'inline-flex' },
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
          spacing={{ lg: 2.5, xl: 3.5 }}
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
                sx={getHeaderNavLinkSx(isActive)}
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
          sx={{
            ...headerRightAreaSx,
            display: 'flex',
            height: 1,
            gap: { xs: 1, sm: 1.25 },
            justifyContent: 'flex-end',
          }}
        >
          {isLoggedIn ? (
            <Suspense fallback={null}>
              <NotificationsDrawer />
              <AccountDrawer data={accountMenuItems} />
            </Suspense>
          ) : (
            <SignInIconButton />
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
          ...headerBarSx,
          ...slotProps?.header?.sx,
        }}
      />
    );
  };

  const isHomePage = pathname === paths.dashboard.root;

  // Defer real footer until after first content paint — avoids footer CLS while route mounts
  const [footerReady, setFooterReady] = useState(false);
  useEffect(() => {
    let idleId: number | undefined;
    let timeoutId: number | undefined;
    const reveal = () => setFooterReady(true);
    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(reveal, { timeout: 2500 });
    } else {
      timeoutId = window.setTimeout(reveal, 1200);
    }
    return () => {
      if (idleId !== undefined && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [pathname]);

  const renderFooter = () =>
    footerReady ? (
      <FooterSection />
    ) : (
      <Box
        component="footer"
        aria-hidden
        sx={{ minHeight: { xs: 640, md: 520 }, bgcolor: '#0a0a0a' }}
      />
    );

  const renderMain = () => (
    <MainSection
      {...slotProps?.main}
      sx={[
        isHomePage && { bgcolor: '#000000' },
        { pb: { xs: 10, lg: 0 } },
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
          '--layout-header-mobile-height': '60px',
          '--layout-header-desktop-height': '68px',
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
        <PublicMobileNav />
      </LayoutSection>
  );
}
