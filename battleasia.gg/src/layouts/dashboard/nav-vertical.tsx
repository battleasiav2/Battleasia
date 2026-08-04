import type { NavSectionProps } from 'src/components/nav-section';
import type { Theme, SxProps, CSSObject, Breakpoint } from '@mui/material/styles';

import { varAlpha, mergeClasses } from 'minimal-shared/utils';

import { styled } from '@mui/material/styles';
import { Box, Stack, Typography } from '@mui/material';

import { Logo } from 'src/components/logo';
import { Scrollbar } from 'src/components/scrollbar';
import { NavSectionMini, NavSectionVertical } from 'src/components/nav-section';

import { useTranslate } from 'src/locales/use-locales';

import { layoutClasses } from '../core/classes';
import { NavToggleButton } from '../components/nav-toggle-button';
import { brandPremiumSoftWordmarkSx } from '../user/user-theme';

// ----------------------------------------------------------------------

export type NavVerticalProps = React.ComponentProps<'div'> & {
    isNavMini: boolean;
    sx?: SxProps<Theme>;
    cssVars?: CSSObject;
    layoutQuery?: Breakpoint;
    onToggleNav: () => void;
    data: NavSectionProps['data'];
    slots?: {
        topArea?: React.ReactNode;
        bottomArea?: React.ReactNode;
    };
};

export function NavVertical({
    sx,
    data,
    slots,
    cssVars,
    className,
    isNavMini,
    onToggleNav,
    layoutQuery = 'md',
    ...other
}: NavVerticalProps) {
    const { t, currentLang } = useTranslate();
    
    // Bengali language has longer text, so use smaller fonts
    const isBengali = currentLang?.value === 'bn';

    const renderNavVertical = () => (
        <>
            {slots?.topArea ?? (
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={{ xs: 1, md: 1.25 }}
                    sx={{ pl: 2.5, pt: 2, pb: 1 }}
                >
                    <Logo
                        sx={{
                            width: { xs: 74, md: 92 },
                            height: { xs: 74, md: 92 },
                            flexShrink: 0,
                            alignSelf: 'center',
                        }}
                    />
                    <Box sx={{ minWidth: 0 }}>
                        <Typography
                            className="font-brand-gaming"
                            sx={{
                                ...brandPremiumSoftWordmarkSx,
                                fontSize: isBengali ? { xs: 18, md: 20 } : { xs: 18, md: 22 },
                            }}
                        >
                            BattleAsia
                        </Typography>
                        <Typography
                            className="font-tr"
                            sx={{
                                mt: 0.35,
                                fontSize: isBengali ? 11 : { xs: 12, md: 14 },
                                color: '#e8e8e8',
                                fontWeight: 500,
                                letterSpacing: 0.8,
                                textTransform: 'uppercase',
                                lineHeight: 1.2,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: isBengali ? 130 : 200,
                            }}
                        >
                            {t('common.brandTagline')}
                        </Typography>
                    </Box>
                </Stack>
            )}

            <Scrollbar fillContent>
                <NavSectionVertical data={data} cssVars={cssVars} sx={{ px: 2, flex: '1 1 auto' }} />
                {/* {slots?.bottomArea ?? <NavUpgrade />} */}
            </Scrollbar>
        </>
    );

    const renderNavMini = () => (
        <>
            {slots?.topArea ?? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2.5 }}>
                    <Logo />
                </Box>
            )}

            <NavSectionMini
                data={data}
                cssVars={cssVars}
                sx={[
                    (theme) => ({
                        ...theme.mixins.hideScrollY,
                        pb: 2,
                        px: 0.5,
                        flex: '1 1 auto',
                        overflowY: 'auto',
                    }),
                ]}
            />

            {slots?.bottomArea}
        </>
    );

    return (
        <NavRoot
            isNavMini={isNavMini}
            layoutQuery={layoutQuery}
            className={mergeClasses([layoutClasses.nav.root, layoutClasses.nav.vertical, className])}
            sx={sx}
            {...other}
        >
            <NavToggleButton
                isNavMini={isNavMini}
                onClick={onToggleNav}
                sx={[
                    (theme) => ({
                        display: 'none',
                        [theme.breakpoints.up(layoutQuery)]: { display: 'inline-flex' },
                    }),
                ]}
            />
            {isNavMini ? renderNavMini() : renderNavVertical()}
        </NavRoot>
    );
}

// ----------------------------------------------------------------------

const NavRoot = styled('div', {
    shouldForwardProp: (prop: string) => !['isNavMini', 'layoutQuery', 'sx'].includes(prop),
})<Pick<NavVerticalProps, 'isNavMini' | 'layoutQuery'>>(
    ({ isNavMini, layoutQuery = 'md', theme }) => ({
        // top: 'var(--layout-header-desktop-height)',
        left: 0,
        height: '100%',
        display: 'none',
        position: 'fixed',
        flexDirection: 'column',
        zIndex: 'var(--layout-nav-zIndex)',
        backgroundColor: 'var(--layout-nav-bg)',
        width: isNavMini ? 'var(--layout-nav-mini-width)' : 'var(--layout-nav-vertical-width)',
        borderRight: `1px solid var(--layout-nav-border-color, ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)})`,
        transition: theme.transitions.create(['width'], {
            easing: 'var(--layout-transition-easing)',
            duration: 'var(--layout-transition-duration)',
        }),
        [theme.breakpoints.up(layoutQuery)]: { display: 'flex' },
    })
);
