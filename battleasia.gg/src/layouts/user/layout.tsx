import type { Breakpoint } from '@mui/material/styles';
import type { NavSectionProps } from 'src/components/nav-section';

import { merge } from 'es-toolkit';
import { lazy, Suspense } from 'react';

import { useTheme, alpha } from '@mui/material/styles';
import { Box, Alert, Stack, Typography } from '@mui/material';


import { RouterLink } from 'src/routes/components';
import { useRouter, usePathname } from 'src/routes/hooks';

import { useSelector } from 'src/store';

import { CONFIG } from 'src/global-config';

import { Logo } from 'src/components/logo';
import { useSettingsContext } from 'src/components/settings';
import { useImagePreloader } from 'src/hooks';
import { AnimatedBalance } from 'src/components/animated-balance';

import { allLangs, useTranslate } from 'src/locales';
import { layoutClasses } from '../core/classes';
import { MainSection } from '../core/main-section';
import { HeaderSection } from '../core/header-section';
import { LayoutSection } from '../core/layout-section';
import { UserNavVertical } from './user-nav-vertical';
import { userLayoutVars, userBattleNavColorVars } from './css-vars';
import { USER_COLORS, userHeaderPillSx, getUserLayoutMainSx } from './user-theme';
import { LanguagePopover } from '../components/language-popover';
import { SignInIconButton } from '../components/sign-in-icon-button';
import {
    headerBarSx,
    headerContainerSx,
    headerCompactSearchSx,
    getHeaderNavLinkSx,
} from '../components/header-chrome';
import { Searchbar } from '../components/searchbar';
import { FloatingFooterNav } from '../components/floating-footer-nav';
import {
    menuItems,
    accountMenuItems,
    sidebarSecondaryItems,
    createMenuClickHandler,
} from '../menu-items-config';

import type { MainSectionProps } from '../core/main-section';
import type { HeaderSectionProps } from '../core/header-section';
import type { LayoutSectionProps } from '../core/layout-section';

const AccountDrawer = lazy(() =>
  import('../components/account-drawer').then((m) => ({ default: m.AccountDrawer }))
);
const NotificationsDrawer = lazy(() =>
  import('../components/notifications-drawer').then((m) => ({ default: m.NotificationsDrawer }))
);

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
    
    const { isLoggedIn, balance, user } = useSelector((state) => state.auth);

    // Preload currency icon
    const { isLoaded: isCurrencyIconLoaded } = useImagePreloader([CONFIG.currencyIcon], {
        delay: 0,
        continueOnError: true,
    });

    const navVars = userBattleNavColorVars(theme, settings.state.navLayout);

    // Convert accountMenuItems to navData — primary arena links + secondary utilities (no nested Account clutter)
    const toNavItem = (item: (typeof accountMenuItems)[number]) => ({
        title: t(item.labelKey),
        path: item.href!,
        icon: item.icon,
    });

    const convertedNavData: NavSectionProps['data'] = [
        {
            subheader: '',
            items: accountMenuItems
                .filter((item) => item.mobileMenu && item.href)
                .map(toNavItem),
        },
        {
            subheader: t('navigation.account'),
            items: sidebarSecondaryItems.filter((item) => item.href).map(toNavItem),
        },
    ];

    const navData = slotProps?.nav?.data ?? convertedNavData;

    const isNavMini = settings.state.navLayout === 'mini';
    const isNavVertical = isNavMini || settings.state.navLayout === 'vertical';

    // Handle smooth scroll to section
    const handleMenuClick = createMenuClickHandler(pathname, router);

    const renderHeader = () => {
        const headerSlotProps: HeaderSectionProps['slotProps'] = {
            container: {
                maxWidth: false,
                sx: {
                    ...headerContainerSx,
                    ...(isNavVertical && { px: { [layoutQuery]: 3 } }),
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
                    sx={{
                        display: { xs: 'flex', md: 'none' },
                        flexShrink: 0,
                        minWidth: 0,
                        pl: { xs: 0.25, sm: 0.5 },
                    }}
                >
                    {/* Mobile-only: logo image — brand text lives in desktop sidebar */}
                    <Logo
                        sx={{
                            width: { xs: 44, sm: 48 },
                            height: { xs: 44, sm: 48 },
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            '& img': {
                                borderRadius: 0.75,
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                            },
                        }}
                    />
                </Stack>
            ),
            centerArea: (
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="center"
                    spacing={1}
                    sx={{
                        display: { xs: 'none', lg: 'flex' },
                        width: 1,
                        flex: 1,
                        minWidth: 0,
                        px: { lg: 1, xl: 2 },
                    }}
                >
                    {isLoggedIn ? (
                        <Searchbar
                            data={navData}
                            sx={{
                                width: 1,
                                maxWidth: 420,
                                justifyContent: 'flex-start',
                                bgcolor: alpha('#000000', 0.45),
                                border: `1px solid ${alpha('#ffffff', 0.1)}`,
                                borderRadius: '6px',
                                px: 0.5,
                                py: 0,
                                ...headerCompactSearchSx,
                                transition: 'border-color 0.2s ease, background-color 0.2s ease',
                                '&:hover': {
                                    bgcolor: alpha('#000000', 0.55),
                                    borderColor: alpha(USER_COLORS.gold, 0.35),
                                },
                                '& .MuiIconButton-root': { color: alpha('#ffffff', 0.7) },
                                '& .MuiLabel-root, & .label': {
                                    bgcolor: alpha(USER_COLORS.gold, 0.15),
                                    color: USER_COLORS.gold,
                                    border: `1px solid ${alpha(USER_COLORS.gold, 0.35)}`,
                                    boxShadow: 'none',
                                },
                            }}
                        />
                    ) : (
                        menuItems.map((item) => {
                            const isActive = item.isActive(pathname);
                            return (
                                <Typography
                                    key={item.href}
                                    component={item.href ? RouterLink : 'span'}
                                    href={item.href}
                                    onClick={(e: any) => handleMenuClick(e, item)}
                                    sx={getHeaderNavLinkSx(isActive)}
                                >
                                    {t(item.labelKey)}
                                </Typography>
                            );
                        })
                    )}
                </Stack>
            ),
            rightArea: (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        flexShrink: 0,
                        gap: { xs: 1, sm: 1.25 },
                    }}
                >
                    {isLoggedIn ? (
                        <>
                            {/* Balance Display */}
                            <Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 1 }} sx={userHeaderPillSx}>
                                {isCurrencyIconLoaded ? (
                                    <img
                                        src={CONFIG.currencyIcon}
                                        alt="Currency Icon"
                                        style={{ width: 'auto', height: 'auto', maxWidth: 20, maxHeight: 20 }}
                                    />
                                ) : (
                                    <Box
                                        sx={{
                                            width: { xs: 18, sm: 20 },
                                            height: { xs: 18, sm: 20 },
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
                            <Suspense fallback={null}>
                              <NotificationsDrawer />
                              <AccountDrawer data={accountMenuItems} />
                            </Suspense>
                        </>
                    ) : (
                        <SignInIconButton />
                    )}

                    {/** @slot Language popover */}
                    <LanguagePopover
                        data={allLangs}
                    />
                </Box>
            ),
        };

        return (
            <HeaderSection
                disableOffset
                layoutQuery={layoutQuery}
                disableElevation={isNavVertical}
                position="fixed"
                {...slotProps?.header}
                slots={{ ...headerSlots, ...slotProps?.header?.slots }}
                slotProps={merge(headerSlotProps, slotProps?.header?.slotProps ?? {})}
                sx={{
                    top: 0,
                    right: 0,
                    left: {
                        xs: 0,
                        [layoutQuery]: isNavMini
                            ? 'var(--layout-nav-mini-width)'
                            : 'var(--layout-nav-vertical-width)',
                    },
                    width: 'auto',
                    ...(headerBarSx as Record<string, unknown>),
                    ...slotProps?.header?.sx,
                }}
            />
        );
    };

    const renderSidebar = () => (
        <UserNavVertical
            data={navData}
            isNavMini={isNavMini}
            layoutQuery={layoutQuery}
            cssVars={navVars.section}
            onToggleNav={() =>
                settings.setField(
                    'navLayout',
                    settings.state.navLayout === 'vertical' ? 'mini' : 'vertical'
                )
            }
            sx={{
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRight: `1px solid ${alpha('#ffffff', 0.08)}`,
            }}
        />
    );

    const renderMain = () => <MainSection {...slotProps?.main}>{children}</MainSection>;

    return (
        <LayoutSection
            /** **************************************
             * @Header
             *************************************** */
            headerSection={renderHeader()}
            /** **************************************
             * @Sidebar
             *************************************** */
            sidebarSection={isNavVertical ? renderSidebar() : null}
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
                            pb: 0,
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

