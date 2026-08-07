import type { Breakpoint } from '@mui/material/styles';
import type { NavSectionProps } from 'src/components/nav-section';

import { useEffect, useState } from 'react';
import { merge } from 'es-toolkit';

import { useTheme, alpha } from '@mui/material/styles';
import { iconButtonClasses } from '@mui/material/IconButton';
import { Box, Alert, Stack, Button, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter, usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useSelector } from 'src/store';

import { Logo } from 'src/components/logo';
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
import { PublicMobileNav } from '../components/public-mobile-nav';
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
          minHeight: { xs: 60, md: 68 },
          height: { xs: 60, md: 68 },
          px: { xs: 1.75, sm: 2.5, md: 3.5 },
          py: 0,
          ...(isNavVertical && { px: { [layoutQuery]: 3.5 } }),
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
      textTransform: 'uppercase' as const,
      fontSize: { lg: 13, xl: 14 },
      fontWeight: isActive ? 700 : 600,
      letterSpacing: '0.08em',
      color: isActive ? GOLD : alpha('#ffffff', 0.72),
      textDecoration: 'none',
      cursor: 'pointer',
      whiteSpace: 'nowrap' as const,
      lineHeight: 1,
      position: 'relative' as const,
      py: 0.75,
      transition: 'color 0.2s ease',
      '&::after': {
        content: '""',
        position: 'absolute',
        left: '50%',
        bottom: 0,
        width: isActive ? '70%' : 0,
        height: 1.5,
        bgcolor: GOLD,
        transform: 'translateX(-50%)',
        transition: 'width 0.2s ease',
        boxShadow: isActive ? `0 0 8px ${alpha(GOLD, 0.55)}` : 'none',
      },
      '&:hover': {
        color: GOLD,
        '&::after': { width: '70%' },
      },
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
          spacing={{ xs: 0.75, sm: 1 }}
          sx={{ flexShrink: 0, minWidth: 0, height: 1 }}
        >
          <Logo
            sx={{
              width: { xs: 52, sm: 58, md: 64 },
              height: { xs: 52, sm: 58, md: 64 },
              flexShrink: 0,
            }}
          />
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 0 }}>
            <Typography
              className="font-brand-gaming"
              sx={{
                fontSize: isBengali
                  ? { xs: 14, sm: 16, md: 18 }
                  : { xs: 15, sm: 17, md: 20 },
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
          spacing={{ lg: 3, xl: 4 }}
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
          spacing={{ xs: 0.65, sm: 1 }}
          sx={{ flexShrink: 0, height: 1, minWidth: { lg: 120 }, justifyContent: 'flex-end' }}
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
                height: { xs: 32, sm: 34 },
                px: { xs: 1.5, sm: 2 },
                fontSize: { xs: 12, sm: 13 },
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
          bgcolor: alpha('#0a0c10', 0.68),
          backdropFilter: 'blur(10px) saturate(1.2)',
          WebkitBackdropFilter: 'blur(10px) saturate(1.2)',
          borderBottom: `1px solid ${alpha('#ffffff', 0.1)}`,
          borderRadius: { xs: '0 0 12px 12px', md: '0 0 16px 16px' },
          boxShadow: `
            inset 0 1px 0 ${alpha('#ffffff', 0.07)},
            0 1px 0 ${alpha(GOLD, 0.1)},
            0 10px 28px ${alpha('#000000', 0.32)}
          `,
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
