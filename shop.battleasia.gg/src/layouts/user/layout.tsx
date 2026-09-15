import type { Breakpoint } from '@mui/material/styles';
import type { NavSectionProps } from 'src/components/nav-section';

import { merge } from 'es-toolkit';

import { useTheme, alpha } from '@mui/material/styles';
import { Box, Alert, Stack, Button, Typography, IconButton } from '@mui/material';
import { Iconify } from 'src/components/iconify';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useRouter, usePathname } from 'src/routes/hooks';

import { useSelector } from 'src/store';
import { CONFIG } from 'src/global-config';
import { allLangs, useTranslate } from 'src/locales';

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
import { AccentPopover } from '../components/accent-popover';
import { FloatingFooterNav } from '../components/floating-footer-nav';
import { menuItems, accountMenuItems, createMenuClickHandler } from '../menu-items-config';
import { goldAlpha } from 'src/theme/accent-presets';

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
          px: { xs: 1.25, sm: 2, md: 3 },
          gap: { xs: 0.75, sm: 1.5 },
          minWidth: 0,
          maxWidth: '100%',
          overflow: 'hidden',
          ...(isNavVertical && { px: { [layoutQuery]: 5 } }),
        },
      },
    };

    const isShopPage = pathname === paths.user.shop;

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
          spacing={{ xs: 0.75, sm: 1.25 }}
          sx={{ flex: '1 1 auto', minWidth: 0, overflow: 'hidden', pr: 1 }}
        >
          <Logo
            href={paths.user.shop}
            sx={{
              width: { xs: 44, sm: 60, md: 72 },
              height: { xs: 44, sm: 60, md: 72 },
              flexShrink: 0,
              '& img': {
                borderRadius: 0.5,
                objectFit: 'contain',
              },
            }}
          />

          {/* Shop-only trust badges — compact on mobile to avoid side-scroll */}
          {isShopPage ? (
            <Stack
              direction="row"
              alignItems="center"
              spacing={{ xs: 0.65, sm: 1 }}
              sx={{ minWidth: 0, overflow: 'hidden' }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.65}
                sx={{
                  px: { xs: 0.9, sm: 1.35 },
                  py: { xs: 0.4, sm: 0.5 },
                  bgcolor: alpha('#070c18', 0.85),
                border: `1px solid ${goldAlpha(0.45)}`,
                borderRadius: '6px',
                boxShadow: `0 4px 14px ${alpha('#000000', 0.5)}`,
                flexShrink: 1,
                minWidth: 0,
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: '#22c55e',
                  boxShadow: '0 0 8px #22c55e',
                  flexShrink: 0,
                }}
              />
              <Typography
                sx={{
                  fontSize: { xs: 9, sm: 11 },
                  fontWeight: 800,
                  letterSpacing: { xs: 0.6, sm: 1.2 },
                  textTransform: 'uppercase',
                  color: '#dcdcdc',
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                }}
              >
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                  OFFICIAL STORE
                </Box>
                <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                  OFFICIAL
                </Box>
              </Typography>
            </Stack>

            <Stack
              direction="row"
              alignItems="center"
              spacing={0.55}
              sx={{
                display: { xs: 'none', sm: 'flex' },
                px: 1.35,
                py: 0.5,
                bgcolor: alpha('#070c18', 0.85),
                border: `1px solid ${goldAlpha(0.45)}`,
                borderRadius: '6px',
                boxShadow: `0 4px 14px ${alpha('#000000', 0.5)}`,
                flexShrink: 0,
              }}
            >
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  bgcolor: goldAlpha(0.18),
                  border: `1px solid ${USER_COLORS.gold}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                  <Iconify icon="eva:checkmark-fill" width={10} sx={{ color: USER_COLORS.gold }} />
                </Box>
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: 1.2,
                    textTransform: 'uppercase',
                    color: USER_COLORS.gold,
                    lineHeight: 1,
                    whiteSpace: 'nowrap',
                  }}
                >
                  VERIFIED STORE
                </Typography>
              </Stack>
            </Stack>
          ) : null}
        </Stack>
      ),
      centerArea: isShopPage ? null : (
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
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 0.5, sm: 1.25 },
            flexShrink: 0,
            maxWidth: { xs: '52%', sm: 'none' },
          }}
        >
          {isLoggedIn ? (
            <>
              <Stack
                direction="row"
                alignItems="center"
                spacing={{ xs: 0.5, sm: 1 }}
                sx={{
                  ...userHeaderPillSx,
                  minWidth: 0,
                  maxWidth: { xs: 108, sm: 'none' },
                  px: { xs: 0.75, sm: undefined },
                }}
              >
                {isCurrencyIconLoaded ? (
                  <Box
                    component="img"
                    src={CONFIG.headerCurrencyIcon}
                    alt="BAC"
                    sx={{
                      width: { xs: 22, sm: 28 },
                      height: { xs: 22, sm: 28 },
                      flexShrink: 0,
                      objectFit: 'contain',
                      display: 'block',
                      filter: `drop-shadow(0 0 6px ${goldAlpha(0.35)})`,
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: { xs: 22, sm: 28 },
                      height: { xs: 22, sm: 28 },
                      bgcolor: alpha('#ffffff', 0.08),
                      borderRadius: '50%',
                      flexShrink: 0,
                    }}
                  />
                )}
                <Box sx={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <AnimatedBalance
                    value={balance ?? 0}
                    fontSize={{ xs: '0.78rem', sm: '1rem' }}
                    fontWeight={700}
                    color={USER_COLORS.gold}
                  />
                </Box>
              </Stack>
              <AccountDrawer data={accountMenuItems} />
            </>
          ) : (
            <Button
              component={RouterLink}
              href={paths.auth.signIn}
              sx={{
                ...userGoldButtonSx,
                height: { xs: 34, sm: 45, md: 53 },
                px: { xs: 1.5, sm: 3, md: 6.7 },
                fontSize: { xs: 13, sm: 16, md: 18 },
                minWidth: { xs: 'auto', sm: undefined },
                fontWeight: 600,
              }}
            >
              {t('nav.login')}
            </Button>
          )}

          <AccentPopover />

          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center' }}>
            <LanguagePopover data={allLangs} />
          </Box>

          <IconButton
            sx={{
              display: { xs: 'none', md: 'inline-flex' },
              color: alpha('#ffffff', 0.8),
              p: 1,
              '&:hover': { color: USER_COLORS.gold, bgcolor: goldAlpha(0.1) },
            }}
          >
            <Iconify icon="eva:search-fill" width={20} />
          </IconButton>
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
          pb: { xs: 1.5, sm: 2.5 },
          overflowX: 'clip',
          maxWidth: '100%',
          ...slotProps?.header?.sx,
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
          maxWidth: '100%',
          overflowX: 'clip',
          bgcolor: USER_COLORS.pageBg,
          [`& .${layoutClasses.root}`]: {
            minHeight: '100vh',
            maxWidth: '100%',
            overflowX: 'clip',
            bgcolor: USER_COLORS.pageBg,
          },
          [`& .${layoutClasses.sidebarContainer}`]: {
            minHeight: '100vh',
            maxWidth: '100%',
            overflowX: 'clip',
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
            minWidth: 0,
            maxWidth: '100%',
            overflowX: 'clip',
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

