import type { Breakpoint } from '@mui/material/styles';
import type { NavSectionProps } from 'src/components/nav-section';

import { merge } from 'es-toolkit';

import { useTheme } from '@mui/material/styles';
import { iconButtonClasses } from '@mui/material/IconButton';
import { Box, Alert, Stack, Button, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useSelector } from 'src/store';
import { allLangs } from 'src/locales';

import { Logo } from 'src/components/logo';
import { SiteScrollProgress } from 'src/components/animate';
import { useSettingsContext } from 'src/components/settings';
import { userGoldButtonSx } from 'src/layouts/user/user-theme';

import { layoutClasses } from '../core/classes';
import { NavHorizontal } from './nav-horizontal';
import { MainSection } from '../core/main-section';
import { HeaderSection } from '../core/header-section';
import { FooterSection } from '../core/footer-section';
import { LayoutSection } from '../core/layout-section';
import { AccountDrawer } from '../components/account-drawer';
import { LanguagePopover } from '../components/language-popover';
import { navData as dashboardNavData } from '../nav-config-dashboard';
import { dashboardLayoutVars, dashboardNavColorVars } from './css-vars';
import { menuItems, accountMenuItems, createMenuClickHandler } from '../menu-items-config';

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
  const { isLoggedIn } = useSelector((state) => state.auth);

  const navVars = dashboardNavColorVars(theme, settings.state.navColor, settings.state.navLayout);

  const navData = slotProps?.nav?.data ?? dashboardNavData;

  const isNavMini = settings.state.navLayout === 'mini';
  const isNavHorizontal = settings.state.navLayout === 'horizontal';
  const isNavVertical = isNavMini || settings.state.navLayout === 'vertical';

  // Handle smooth scroll to section
  const handleMenuClick = createMenuClickHandler(pathname);

  // Menu styling variables
  const menuStyles = {
    fontSize: 22,
    fontWeight: 'normal' as const,
    activeColor: '#feab02',
    inactiveColor: '#d9d9d8',
    transition: 'color 0.2s',
  };

  const renderHeader = () => {
    const headerSlotProps: HeaderSectionProps['slotProps'] = {
      container: {
        maxWidth: false,
        sx: {
          ...(isNavVertical && { px: { [layoutQuery]: 5 } }),
          ...(isNavHorizontal && {
            bgcolor: 'var(--layout-nav-bg)',
            height: { [layoutQuery]: 'var(--layout-nav-horizontal-height)' },
            [`& .${iconButtonClasses.root}`]: { color: 'var(--layout-nav-text-secondary-color)' },
          }),
        },
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
        <Stack direction="row" alignItems="center" height={1} >
          <Logo
            sx={{
              top: { xs: 5, md: 15 },
              left: { xs: 10, sm: "auto" },
              width: { xs: "auto", md: "auto" },
              maxWidth: { xs: "94px", md: "143px" },
              height: { xs: 80, md: 110 },
              position: 'absolute',
              [theme.breakpoints.up(layoutQuery)]: { display: 'inline-flex' },
              "& img": {
                borderRadius: "10%",
                width: "100%",
                height: "100%",
                objectFit: "contain",
                WebkitObjectFit: "contain",
              }
            }}
          />
          <Typography
            component="div"
            className="font-tr"
            sx={{
              mt: { xs: 1, sm: 0 },
              ml: { xs: "94px", md: "143px" },
              fontSize: 28,
              color: "#feab02",
              fontWeight: 'normal',
              lineHeight: 1,
            }}
          >
            Battle Asia<br />
            <Box component="span"
              sx={{ fontSize: { xs: 14, sm: 18 }, color: "#d9d9d8", whiteSpace: "nowrap" }}
            >
              OFFICIAL PUBG ON MOBILE
            </Box>
          </Typography>
        </Stack>
      ),
      centerArea: (
        <Stack
          direction="row"
          alignItems="center"
          spacing={{ sm: 2, md: 4 }}
          sx={{
            display: { xs: 'none', sm: 'flex' },
            width: 1,
            pl: { sm: 2, md: 5 },
            flex: 1,
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
                sx={{
                  textTransform: 'none',
                  fontSize: menuStyles.fontSize,
                  fontWeight: 600,
                  letterSpacing: 0.02,
                  color: isActive ? menuStyles.activeColor : menuStyles.inactiveColor,
                  textDecoration: 'none',
                  cursor: 'pointer',
                  whiteSpace: "nowrap",
                  transition: menuStyles.transition,
                  '&:hover': {
                    color: menuStyles.activeColor,
                  },
                }}
              >
                {item.label}
              </Typography>
            );
          })}
        </Stack>
      ),
      rightArea: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0, sm: 0.75 } }}>
          {isLoggedIn ? (
            <AccountDrawer data={accountMenuItems} />
          ) : (
            <Button
              component={RouterLink}
              href={paths.auth.signIn}
              sx={{
                ...userGoldButtonSx,
                height: { sm: 45, md: 53 },
                px: { sm: 3, md: 6.7 },
                fontSize: { sm: 16, md: 18 },
                fontWeight: 600,
              }}
            >
              LOGIN
            </Button>
          )}

          {/** @slot Language popover */}
          <LanguagePopover data={allLangs} />

          {/** @slot Settings button */}
          {/* <SettingsButton /> */}

        </Box>
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
          backgroundImage: 'url(/assets/images/nav-bg.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat-x',
          pb: 2.5,
          ...slotProps?.header?.sx
        }}
      />
    );
  };


  const renderFooter = () => <FooterSection />;

  const renderMain = () => <MainSection {...slotProps?.main}>{children}</MainSection>;

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
        cssVars={{ ...dashboardLayoutVars(theme), ...navVars.layout, ...cssVars }}
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
