import type { Breakpoint } from '@mui/material/styles';
import type { NavSectionProps } from 'src/components/nav-section';

import { merge } from 'es-toolkit';

import { useTheme } from '@mui/material/styles';
import { iconButtonClasses } from '@mui/material/IconButton';
import { Box, Alert, Stack, Button, Typography } from '@mui/material';

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
                    alignItems: 'flex-end',
                    pb: { xs: 0.5, md: 1 },
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
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={{ xs: 1, sm: 1.25, md: 1.5 }}
                    sx={{
                        flexShrink: 0,
                        minWidth: 0,
                        mb: { xs: 0.25, md: 0.5 },
                        pr: { md: 1 },
                    }}
                >
                    <Logo
                        sx={{
                            width: { xs: 52, sm: 76, md: 92 },
                            height: { xs: 52, sm: 76, md: 92 },
                            flexShrink: 0,
                            alignSelf: { md: 'flex-start' },
                            mt: { md: -1.5, lg: -2.5 },
                            '& img': {
                                borderRadius: '10%',
                                width: 1,
                                height: 1,
                                objectFit: 'contain',
                            },
                        }}
                    />
                    <Box sx={{ minWidth: 0, pt: { xs: 0.25, md: 0.75 } }}>
                        <Typography
                            className="font-tr"
                            sx={{
                                fontSize: isBengali
                                    ? { xs: 18, sm: 22, md: 30, lg: 32 }
                                    : { xs: 20, sm: 24, md: 30, lg: 32 },
                                color: '#feab02',
                                fontWeight: 700,
                                lineHeight: 1.05,
                                letterSpacing: 0.3,
                            }}
                        >
                            {t('common.brandName')}
                        </Typography>
                        <Typography
                            className="font-tr"
                            sx={{
                                mt: 0.4,
                                fontSize: isBengali
                                    ? { xs: 8, sm: 10, md: 12, lg: 14 }
                                    : { xs: 10, sm: 12, md: 13, lg: 15 },
                                color: '#e8e8e8',
                                fontWeight: 500,
                                letterSpacing: { xs: 0.6, md: 1 },
                                textTransform: 'uppercase',
                                lineHeight: 1.2,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: { xs: 130, sm: 170, md: 220 },
                                opacity: 0.95,
                            }}
                        >
                            {t('common.brandTagline')}
                        </Typography>
                    </Box>
                </Stack>
            ),
            centerArea: (
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="center"
                    spacing={{ lg: 2, xl: 4 }}
                    sx={{
                        display: { xs: 'none', lg: 'flex' },
                        width: 1,
                        flex: 1,
                        minWidth: 0,
                        px: { lg: 1, xl: 2 },
                        mb: { xs: 0.25, md: 0.5 },
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
                                    fontSize: { lg: 18, xl: 22 },
                                    fontWeight: menuStyles.fontWeight,
                                    color: isActive ? menuStyles.activeColor : menuStyles.inactiveColor,
                                    textDecoration: 'none',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
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
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: { xs: 0.5, sm: 2 },
                    flexShrink: 0,
                    mt: { xs: 2, sm: 3, md: 5 },
                    mb: { xs: 0.25, md: 0.5 },
                }}>
                    {isLoggedIn ? (
                        <>
                            <NotificationsDrawer />
                            <AccountDrawer data={accountMenuItems} />
                        </>
                    ) : (
                        <Button
                            component={RouterLink}
                            href={paths.auth.signIn}
                            className="font-tr"
                            sx={{
                                height: { xs: 32, sm: 45, md: 53 },
                                px: { xs: 2, sm: 3, md: 6.7 },
                                fontSize: { xs: 14, sm: 24, md: 28 },
                                color: "#000",
                                fontWeight: "normal",
                                borderRadius: 0,
                                background: "url(/assets/images/btn-bg.webp) no-repeat center center",
                                backgroundSize: "cover",
                                whiteSpace: 'nowrap',
                                minWidth: 'auto',
                            }}
                        >
                            {t('auth.signIn')}
                        </Button>
                    )}

                    {/** @slot Language popover */}
                    <LanguagePopover
                        data={allLangs}
                    />

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
    );
}
