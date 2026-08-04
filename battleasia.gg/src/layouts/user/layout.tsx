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
import { useSettingsContext } from 'src/components/settings';
import { useImagePreloader } from 'src/hooks';
import { AnimatedBalance } from 'src/components/animated-balance';

import { allLangs, useTranslate } from 'src/locales';
import { layoutClasses } from '../core/classes';
import { MainSection } from '../core/main-section';
import { HeaderSection } from '../core/header-section';
import { LayoutSection } from '../core/layout-section';
import { UserNavVertical } from './user-nav-vertical';
import { AccountDrawer } from '../components/account-drawer';
import { NotificationsDrawer } from '../components/notifications-drawer';
import { userLayoutVars, userBattleNavColorVars } from './css-vars';
import { USER_COLORS, userGoldButtonSx, userHeaderPillSx, getUserLayoutMainSx } from './user-theme';
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
    
    const { isLoggedIn, balance, user } = useSelector((state) => state.auth);

    // Preload currency icon
    const { isLoaded: isCurrencyIconLoaded } = useImagePreloader([CONFIG.currencyIcon], {
        delay: 0,
        continueOnError: true,
    });

    const navVars = userBattleNavColorVars(theme, settings.state.navLayout);

    // Convert accountMenuItems to navData format with parent-child structure
    const convertedNavData: NavSectionProps['data'] = [
        {
            subheader: '',
            items: accountMenuItems
                .filter((item) => item.href || (item.children && item.children.length > 0)) // Include items with href or children
                .map((item) => {
                    // If item has children, preserve parent-child structure
                    if (item.children && item.children.length > 0) {
                        return {
                            title: t(item.labelKey),
                            path: item.href || item.children[0]?.href || '#', // Use href or first child's href as fallback
                            icon: item.icon,
                            children: item.children
                                .filter((child) => child.href) // Only include children with href
                                .map((child) => ({
                                    title: t(child.labelKey),
                                    path: child.href!,
                                    icon: child.icon,
                                })),
                        };
                    }
                    // Regular item without children
                    return {
                        title: t(item.labelKey),
                        path: item.href!,
                        icon: item.icon,
                    };
                }),
        },
    ];

    const navData = slotProps?.nav?.data ?? convertedNavData;

    const isNavMini = settings.state.navLayout === 'mini';
    const isNavVertical = isNavMini || settings.state.navLayout === 'vertical';

    // Handle smooth scroll to section
    const handleMenuClick = createMenuClickHandler(pathname, router);

    // Menu styling variables
    const menuStyles = {
        fontSize: { lg: 14, xl: 15 },
        fontWeight: 700 as const,
        activeColor: USER_COLORS.gold,
        inactiveColor: alpha('#ffffff', 0.55),
        transition: 'all 0.2s ease',
    };

    const userHeaderNavItems = accountMenuItems.filter((item) => item.href && item.mobileMenu);

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
                    sx={{
                        display: { xs: 'flex', md: 'none' },
                        flexShrink: 0,
                        minWidth: 0,
                    }}
                >
                    <Logo
                        sx={{
                            width: { xs: 52, sm: 58 },
                            height: { xs: 52, sm: 58 },
                            flexShrink: 0,
                            '& img': { borderRadius: 0.5 },
                        }}
                    />
                    <Stack direction="row" alignItems="center" spacing={0.65} sx={{ minWidth: 0 }}>
                        <Typography
                            component={RouterLink}
                            href="/"
                            className="font-brand-gaming"
                            sx={{
                                fontSize: { xs: 16, sm: 18 },
                                fontWeight: 800,
                                textDecoration: 'none',
                                whiteSpace: 'nowrap',
                                lineHeight: 1,
                                background: `linear-gradient(180deg, #ffe08a 0%, ${USER_COLORS.gold} 48%, #d4a017 100%)`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                filter: `drop-shadow(0 0 10px ${alpha(USER_COLORS.gold, 0.45)}) drop-shadow(0 1px 3px rgba(0,0,0,0.75))`,
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
                    {isLoggedIn
                        ? userHeaderNavItems.map((item) => {
                            const isActive = item.href ? pathname.startsWith(item.href) : false;
                            return (
                                <Typography
                                    key={item.href}
                                    component={RouterLink}
                                    href={item.href!}
                                    sx={{
                                        px: 1.75,
                                        py: 0.75,
                                        borderRadius: '4px',
                                        textTransform: 'none',
                                        fontSize: menuStyles.fontSize,
                                        fontWeight: 600,
                                        letterSpacing: 0.02,
                                        color: isActive ? '#111111' : menuStyles.inactiveColor,
                                        bgcolor: isActive ? USER_COLORS.gold : alpha('#000000', 0.35),
                                        border: `1px solid ${isActive ? alpha(USER_COLORS.gold, 0.6) : alpha('#ffffff', 0.1)}`,
                                        textDecoration: 'none',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        transition: menuStyles.transition,
                                        '&:hover': {
                                            color: isActive ? '#111111' : USER_COLORS.gold,
                                            borderColor: alpha(USER_COLORS.gold, 0.35),
                                            bgcolor: isActive ? USER_COLORS.gold : alpha(USER_COLORS.gold, 0.1),
                                        },
                                    }}
                                >
                                    {t(item.labelKey)}
                                </Typography>
                            );
                        })
                        : menuItems.map((item) => {
                            const isActive = item.isActive(pathname);
                            return (
                                <Typography
                                    key={item.href}
                                    component={item.href ? RouterLink : 'span'}
                                    href={item.href}
                                    onClick={(e: any) => handleMenuClick(e, item)}
                                    sx={{
                                        textTransform: 'none',
                                        fontSize: { lg: 15, xl: 16 },
                                        fontWeight: 600,
                                        letterSpacing: 0.02,
                                        color: isActive ? USER_COLORS.gold : '#d9d9d8',
                                        textDecoration: 'none',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        transition: 'color 0.2s',
                                        '&:hover': {
                                            color: USER_COLORS.gold,
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 2 }, flexShrink: 0 }}>
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
                            <NotificationsDrawer />
                            <AccountDrawer data={accountMenuItems} />
                        </>
                    ) : (
                        <Button
                            component={RouterLink}
                            href={paths.auth.signIn}
                            sx={{
                                ...userGoldButtonSx,
                                height: { xs: 34, sm: 42, md: 48 },
                                px: { xs: 1.75, sm: 2.75, md: 4 },
                                minWidth: { xs: 0, sm: 'auto' },
                                fontSize: { xs: 11, sm: 13, md: 15 },
                                fontWeight: 800,
                                letterSpacing: 0.8,
                                whiteSpace: 'nowrap',
                                borderRadius: '6px',
                            }}
                        >
                            {t('auth.signIn')}
                        </Button>
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
                    minHeight: { xs: 64, sm: 68 },
                    bgcolor: alpha('#000000', 0.78),
                    borderBottom: 'none',
                    backdropFilter: { xs: 'blur(10px)', md: 'blur(16px)' },
                    WebkitBackdropFilter: { xs: 'blur(10px)', md: 'blur(16px)' },
                    boxShadow: `
                        inset 0 1px 0 ${alpha('#ffffff', 0.06)},
                        0 8px 28px ${alpha('#000000', 0.35)}
                    `,
                    // Gold brand rail under the bar
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: 1.5,
                        background: `linear-gradient(90deg, transparent 0%, ${alpha(USER_COLORS.gold, 0.15)} 12%, ${USER_COLORS.gold} 50%, ${alpha(USER_COLORS.gold, 0.15)} 88%, transparent 100%)`,
                        pointerEvents: 'none',
                    },
                    pb: { xs: 0.75, sm: 1 },
                    pt: { xs: 0.75, sm: 1 },
                    ...slotProps?.header?.sx
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

