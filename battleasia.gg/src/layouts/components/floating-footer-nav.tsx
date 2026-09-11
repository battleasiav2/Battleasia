import { useMemo } from 'react';

import { Box, alpha } from '@mui/material';

import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useTranslate } from 'src/locales';

import { USER_COLORS } from 'src/layouts/user/user-theme';
import { accountMenuItems } from '../menu-items-config';
import { goldAlpha } from 'src/theme/accent-presets';

// ----------------------------------------------------------------------

const GOLD = USER_COLORS.gold;

type NavItem = {
    labelKey: string;
    href: string;
    icon: React.ReactNode;
    isActive: (pathname: string) => boolean;
};

// ----------------------------------------------------------------------

export function FloatingFooterNav() {
    const pathname = usePathname();
    const { t } = useTranslate();

    const navItems: NavItem[] = useMemo(() => accountMenuItems
        .filter((item) => item.mobileMenu === true && item.href)
        .map((item) => ({
            labelKey: item.labelKey,
            href: item.href!,
            icon: item.icon,
            isActive: (currentPath: string) => currentPath.startsWith(item.href!),
        }))
        , []
    );

    return (
        <Box
            sx={{
                display: { xs: 'flex', md: 'none' },
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
        zIndex: 1200,
                alignItems: 'stretch',
                justifyContent: 'space-between',
                px: 0.5,
                pt: 1,
                pb: 'max(8px, env(safe-area-inset-bottom))',
                bgcolor: 'transparent',
                backgroundImage: `linear-gradient(180deg, ${alpha('#161618', 0.58)} 0%, ${alpha('#050508', 0.7)} 100%)`,
                borderTop: `1px solid ${alpha('#ffffff', 0.08)}`,
                boxShadow: `0 -10px 28px ${alpha('#000000', 0.35)}, inset 0 1px 0 ${alpha('#ffffff', 0.06)}`,
                backdropFilter: 'blur(18px) saturate(1.2)',
                WebkitBackdropFilter: 'blur(18px) saturate(1.2)',
            }}
        >
            {navItems.map((item) => {
                const isActive = item.isActive(pathname);

                return (
                    <Box
                        key={item.href}
                        component={RouterLink}
                        href={item.href}
                        sx={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 0.4,
                            py: 0.5,
                            textDecoration: 'none',
                            transition: 'color 0.2s ease',
                            color: isActive ? GOLD : '#9CA3AF',
                            '&:hover': { color: GOLD },
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 20,
                                height: 20,
                                '& svg': { width: 20, height: 20, color: 'inherit' },
                            }}
                        >
                            {item.icon}
                        </Box>
                        <Box
                            component="span"
                            sx={{
                                fontSize: 9.5,
                                fontWeight: isActive ? 800 : 600,
                                letterSpacing: 0.3,
                                textTransform: 'uppercase',
                                lineHeight: 1,
                                textAlign: 'center',
                            }}
                        >
                            {t(item.labelKey)}
                        </Box>
                        <Box
                            sx={{
                                mt: 0.25,
                                height: 2,
                                width: isActive ? 22 : 0,
                                bgcolor: GOLD,
                                transition: 'width 0.2s ease',
                                boxShadow: isActive ? `0 0 6px ${goldAlpha(0.55)}` : 'none',
                            }}
                        />
                    </Box>
                );
            })}
        </Box>
    );
}
