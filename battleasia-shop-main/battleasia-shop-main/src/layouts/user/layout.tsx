import type { Breakpoint } from '@mui/material/styles';
import type { NavSectionProps } from 'src/components/nav-section';

import { merge } from 'es-toolkit';

import { useTheme, alpha } from '@mui/material/styles';
import { Box, Alert, Stack, Button, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useRouter, usePathname } from 'src/routes/hooks';

import { useSelector } from 'src/store';
import { CONFIG } from 'src/global-config';

import { Logo } from 'src/components/logo';
import { AnimatedBalance } from 'src/components/animated-balance';
import { useSettingsContext } from 'src/components/settings';
import { useImagePreloader } from 'src/hooks';

import { layoutClasses } from '../core/classes';
import { MainSection } from '../core/main-section';
import { HeaderSection } from '../core/header-section';
import { FooterSection } from '../core/footer-section';
import { LayoutSection } from '../core/layout-section';
import { AccountDrawer } from '../components/account-drawer';
import { USER_COLORS, userHeaderPillSx } from './user-theme';
import { userLayoutVars, userNavColorVars } from './css-vars';
import { LanguagePopover } from '../components/language-popover';
import { FloatingFooterNav } from '../components/floating-footer-nav';
import { menuItems, accountMenuItems, createMenuClickHandler } from '../menu-items-config';

import type { MainSectionProps } from '../core/main-section';
import type { HeaderSectionProps } from '../core/header-section';
import type { LayoutSectionProps } from '../core/layout-section';

// ----------------------------------------------------------------------

type LayoutBaseProps = Pick<LayoutSectionProps, 'sx' | 'children' | 'cssVars'>;

export type UserLayoutProps = LayoutBaseProps & {
  layoutQuery?: Breakpoint;
  slotProps?: {
    header?: HeaderSectionProps;
    nav?: {
      data?: NavSectionProps['data'];
    };
    main?: MainSectionProps;
  };
};

export function UserLayout({
  sx,
  cssVars,
  children,
  slotProps,
  layoutQuery = 'lg',
}: UserLayoutProps) {
  const theme = useTheme();

  const settings = useSettingsContext();
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn, balance } = useSelector((state) => state.auth);

  // Preload currency icon
  const { isLoaded: isCurrencyIconLoaded } = useImagePreloader([CONFIG.headerCurrencyIcon], {
    delay: 0,
    continueOnError: true,
  });

  const navVars = userNavColorVars(theme, settings.state.navColor, settings.state.navLayout);

  // Convert accountMenuItems to navData format with parent-child structure
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const convertedNavData: NavSectionProps['data'] = [
    {
      subheader: '',
      items: accountMenuItems
        .filter((item) => item.href || (item.children && item.children.length > 0)) // Include items with href or children
        .map((item) => {
          // If item has children, preserve parent-child structure
          if (item.children && item.children.length > 0) {
            return {
              title: item.label,
              path: item.href || item.children[0]?.href || '#', // Use href or first child's href as fallback
              icon: item.icon,
              children: item.children
                .filter((child) => child.href) // Only include children with href
                .map((child) => ({
                  title: child.label,
                  path: child.href!,
                  icon: child.icon,
                })),
            };
          }
          // Regular item without children
          return {
            title: item.label,
            path: item.href!,
            icon: item.icon,
          };
        }),
    },
  ];

  const isNavMini = settings.state.navLayout === 'mini';
  const isNavVertical = isNavMini || settings.state.navLayout === 'vertical';

  // Handle smooth scroll to section
  const handleMenuClick = createMenuClickHandler(pathname, router);

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
        },
      },
    };

    const headerSlots: HeaderSectionProps['slots'] = {
      topArea: (
        <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
          This is an info Alert.
        </Alert>
      ),
      leftArea: (
        <Logo
          href={paths.user.shop}
          sx={{
            width: { xs: 56, sm: 72, md: 80 },
            height: { xs: 56, sm: 72, md: 80 },
            flexShrink: 0,
            mt: { xs: 2, sm: 0 },
            '& img': {
              borderRadius: 0.5,
              objectFit: 'contain',
            },
          }}
        />
      ),
      centerArea: (
        <Stack
          direction="row"
          alignItems="center"
          spacing={{ sm: 2, md: 4 }}
          sx={{
            display: { xs: 'none', md: 'flex' },
            width: 1,
            pl: { md: 2 },
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
                className="font-tr"
                sx={{
                  textTransform: 'uppercase',
                  fontSize: menuStyles.fontSize,
                  fontWeight: menuStyles.fontWeight,
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
          {isLoggedIn ? (
            <>
              {/* Balance Display */}
              <Stack direction="row" alignItems="center" spacing={{ xs: 0.75, sm: 1 }} sx={userHeaderPillSx}>
                {isCurrencyIconLoaded ? (
                  <Box
                    component="img"
                    src={CONFIG.headerCurrencyIcon}
                    alt="BAC"
                    sx={{
                      width: { xs: 26, sm: 28 },
                      height: { xs: 26, sm: 28 },
                      flexShrink: 0,
                      objectFit: 'contain',
                      display: 'block',
                      filter: `drop-shadow(0 0 6px ${alpha(USER_COLORS.gold, 0.35)})`,
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: { xs: 26, sm: 28 },
                      height: { xs: 26, sm: 28 },
                      bgcolor: alpha('#ffffff', 0.08),
                      borderRadius: '50%',
                      flexShrink: 0,
                    }}
                  />
                )}
                <AnimatedBalance
                  value={balance ?? 0}
                  fontSize={{ xs: '0.85rem', sm: '1rem' }}
                  fontWeight={700}
                  color={USER_COLORS.gold}
                />
              </Stack>
              <AccountDrawer data={accountMenuItems} />
            </>
          ) : (
            <Button
              component={RouterLink}
              href={paths.auth.signIn}
              className="font-tr"
              sx={{
                height: { sm: 45, md: 53 },
                px: { sm: 3, md: 6.7 },
                fontSize: { sm: 24, md: 28 },
                color: "#000",
                fontWeight: "normal",
                borderRadius: 0,
                background: "url(/assets/images/btn-bg.webp) no-repeat center center",
                backgroundSize: "cover",
              }}
            >
              LOGIN
            </Button>
          )}

          {/** @slot Language popover */}
          <LanguagePopover
            data={[
              { value: 'en', label: 'English', countryCode: 'GB' },
              { value: 'fr', label: 'French', countryCode: 'FR' },
              { value: 'vi', label: 'Vietnamese', countryCode: 'VN' },
              { value: 'cn', label: 'Chinese', countryCode: 'CN' },
              { value: 'ar', label: 'Arabic', countryCode: 'SA' },
            ]}
          />
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

  const renderFooter = () => (
    <Box
      sx={{
        width: 1,
        // Remove footer offset to make it full-width
        // [theme.breakpoints.up(layoutQuery)]: footerOffset
        //   ? { pl: footerOffset }
        //   : undefined,
      }}
    >
      <FooterSection />
    </Box>
  );

  const renderMain = () => <MainSection {...slotProps?.main}>{children}</MainSection>;

  return (
    <LayoutSection
      /** **************************************
       * @Header
       *************************************** */
      headerSection={renderHeader()}
      /** **************************************
      //  * @Sidebar
      //  *************************************** */
      // sidebarSection={isNavVertical ? renderSidebar() : null}
      /** **************************************
       * @Footer
       *************************************** */
      footerSection={renderFooter()}
      /** **************************************
       * @Styles
       *************************************** */
      cssVars={{ ...userLayoutVars(theme), ...navVars.layout, ...cssVars }}
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
          // Add bottom padding on mobile for floating footer
          [`& .${layoutClasses.main}`]: {
            [theme.breakpoints.down('md')]: {
              pb: 10,
            },
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {renderMain()}
      <FloatingFooterNav />
    </LayoutSection>
  );
}

