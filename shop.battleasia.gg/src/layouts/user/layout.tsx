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
import { useTranslate } from 'src/locales/use-locales';

import { Logo } from 'src/components/logo';
import { AnimatedBalance } from 'src/components/animated-balance';
import { useSettingsContext } from 'src/components/settings';
import { useImagePreloader } from 'src/hooks';

import { layoutClasses } from '../core/classes';
import { MainSection } from '../core/main-section';
import { HeaderSection } from '../core/header-section';
import { LayoutSection } from '../core/layout-section';
import { AccountDrawer } from '../components/account-drawer';
import { USER_COLORS, userGoldButtonSx, userHeaderPillSx, getUserLayoutMainSx } from './user-theme';
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

  const { t } = useTranslate();
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
    activeColor: USER_COLORS.gold,
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
        <Stack
          direction="row"
          alignItems="center"
          spacing={{ xs: 1, sm: 1.25 }}
          sx={{ flexShrink: 0, minWidth: 0 }}
        >
          <Logo
            href={paths.user.shop}
            sx={{
              width: { xs: 52, sm: 64, md: 72 },
              height: { xs: 52, sm: 64, md: 72 },
              flexShrink: 0,
              '& img': {
                borderRadius: 0.5,
                objectFit: 'contain',
              },
            }}
          />
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.65}
            sx={{ display: { xs: 'flex', md: 'none' }, minWidth: 0 }}
          >
            <Typography
              component={RouterLink}
              href={paths.user.shop}
              className="font-brand-gaming"
              sx={{
                fontSize: { xs: 16, sm: 18 },
                fontWeight: 800,
                color: USER_COLORS.gold,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                lineHeight: 1,
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
                px: 0.55,
                py: 0.15,
                borderRadius: '3px',
                border: `1px solid ${alpha(USER_COLORS.gold, 0.65)}`,
                bgcolor: alpha(USER_COLORS.gold, 0.08),
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography
                className="font-tr"
                sx={{
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 0.5,
                  color: USER_COLORS.gold,
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
                {t(item.labelKey)}
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
              sx={{
                ...userGoldButtonSx,
                height: { xs: 36, sm: 45, md: 53 },
                px: { xs: 2, sm: 3, md: 6.7 },
                fontSize: { xs: 14, sm: 16, md: 18 },
                minWidth: { xs: 'auto', sm: undefined },
                fontWeight: 600,
              }}
            >
              {t('nav.login')}
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

  const renderMain = () => <MainSection {...slotProps?.main}>{children}</MainSection>;

  return (
    <LayoutSection
      /** **************************************
       * @Header
       *************************************** */
      headerSection={renderHeader()}
      /** Logged-in area: no site footer (mobile uses FloatingFooterNav) */
      footerSection={null}
      /** **************************************
       * @Styles
       *************************************** */
      cssVars={{ ...userLayoutVars(theme), ...navVars.layout, ...cssVars }}
      sx={[
        {
          minHeight: '100vh',
          bgcolor: USER_COLORS.pageBg,
          [`& .${layoutClasses.root}`]: {
            minHeight: '100vh',
            bgcolor: USER_COLORS.pageBg,
          },
          [`& .${layoutClasses.sidebarContainer}`]: {
            minHeight: '100vh',
            bgcolor: USER_COLORS.pageBg,
            [theme.breakpoints.up(layoutQuery)]: {
              pl: isNavMini ? 'var(--layout-nav-mini-width)' : 'var(--layout-nav-vertical-width)',
              transition: theme.transitions.create(['padding-left'], {
                easing: 'var(--layout-transition-easing)',
                duration: 'var(--layout-transition-duration)',
              }),
            },
          },
          [`& .${layoutClasses.main}`]: {
            display: 'flex',
            flex: '1 1 auto',
            flexDirection: 'column',
            bgcolor: USER_COLORS.pageBg,
            ...getUserLayoutMainSx(),
            [`& .MuiCard-root`]: {
              backgroundImage: 'none',
              backgroundColor: alpha('#0a0a0a', 0.94),
              color: USER_COLORS.textBody,
            },
            [`& .MuiPaper-root:not(.MuiDrawer-paper):not(.MuiPopover-paper):not(.MuiDialog-paper)`]: {
              backgroundImage: 'none',
            },
            [theme.breakpoints.down('md')]: {
              pb: 14,
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

