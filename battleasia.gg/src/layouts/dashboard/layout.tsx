import type { Breakpoint } from '@mui/material/styles';
import type { NavSectionProps } from 'src/components/nav-section';

import { useEffect, useState } from 'react';
import { merge } from 'es-toolkit';

import { useTheme } from '@mui/material/styles';
import { iconButtonClasses } from '@mui/material/IconButton';
import { Box } from '@mui/material';

import { paths } from 'src/routes/paths';
import { usePathname } from 'src/routes/hooks';

import { useSettingsContext } from 'src/components/settings';

import { layoutClasses } from '../core/classes';
import { NavHorizontal } from './nav-horizontal';
import { MainSection } from '../core/main-section';
import { FooterSection } from '../core/footer-section';
import { LayoutSection } from '../core/layout-section';
import { HomeHeader } from '../components/home-header';
import { navData as dashboardNavData } from '../nav-config-dashboard';
import { dashboardLayoutVars, dashboardNavColorVars } from './css-vars';
import { PublicMobileNav } from '../components/public-mobile-nav';

import type { MainSectionProps } from '../core/main-section';
import type { HeaderSectionProps } from '../core/header-section';
import type { LayoutSectionProps } from '../core/layout-section';

// ----------------------------------------------------------------------

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

  const settings = useSettingsContext();
  const pathname = usePathname();

  const navVars = dashboardNavColorVars(theme, settings.state.navColor, settings.state.navLayout);

  const navData = slotProps?.nav?.data ?? dashboardNavData;

  const isNavMini = settings.state.navLayout === 'mini';
  const isNavHorizontal = settings.state.navLayout === 'horizontal';
  const isNavVertical = isNavMini || settings.state.navLayout === 'vertical';

  const renderHeader = () => (
    <HomeHeader
      layoutQuery={layoutQuery}
      disableElevation={isNavVertical}
      slotProps={{
        header: {
          ...slotProps?.header,
          slotProps: merge(
            {
              container: {
                sx: {
                  ...(isNavVertical && { px: { [layoutQuery]: 3 } }),
                  ...(isNavHorizontal && {
                    bgcolor: 'var(--layout-nav-bg)',
                    height: { [layoutQuery]: 'var(--layout-nav-horizontal-height)' },
                    [`& .${iconButtonClasses.root}`]: {
                      color: 'var(--layout-nav-text-secondary-color)',
                    },
                  }),
                },
              },
            },
            slotProps?.header?.slotProps ?? {}
          ),
        },
      }}
      slots={{
        bottomArea: isNavHorizontal ? (
          <NavHorizontal data={navData} layoutQuery={layoutQuery} cssVars={navVars.section} />
        ) : null,
        ...slotProps?.header?.slots,
      }}
    />
  );

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
          '--layout-header-mobile-height': '54px',
          '--layout-header-desktop-height': '58px',
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
