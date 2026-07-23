import { useMemo } from 'react';

import { Box, alpha } from '@mui/material';

import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useTranslate } from 'src/locales';
import { GLASS_CARD_RADIUS } from 'src/components/battle-glass-card';

import { USER_COLORS } from 'src/layouts/user/user-theme';
import { accountMenuItems } from '../menu-items-config';

// ----------------------------------------------------------------------

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
                bottom: 12,
                left: 12,
                right: 12,
                zIndex: 1300,
                gap: 0.5,
                alignItems: 'stretch',
                justifyContent: 'space-between',
                px: 1,
                py: 0.75,
                borderRadius: `${GLASS_CARD_RADIUS + 4}px`,
                bgcolor: alpha('#000000', 0.82),
                border: `1px solid ${alpha('#ffffff', 0.12)}`,
                boxShadow: `0 12px 40px ${alpha('#000000', 0.7)}, inset 0 1px 0 ${alpha('#ffffff', 0.08)}`,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
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
                            gap: 0.35,
                            py: 0.75,
                            textDecoration: 'none',
                            borderRadius: `${GLASS_CARD_RADIUS}px`,
                            transition: 'all 0.22s cubic-bezier(0.22, 1, 0.36, 1)',
                            color: isActive ? USER_COLORS.gold : alpha('#ffffff', 0.5),
                            bgcolor: isActive ? alpha(USER_COLORS.gold, 0.12) : 'transparent',
                            border: `1px solid ${isActive ? alpha(USER_COLORS.gold, 0.28) : 'transparent'}`,
                            '&:hover': {
                                color: USER_COLORS.gold,
                                bgcolor: alpha(USER_COLORS.gold, 0.08),
                            },
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 22,
                                height: 22,
                                '& svg': {
                                    width: 22,
                                    height: 22,
                                    color: 'inherit',
                                },
                            }}
                        >
                            {item.icon}
                        </Box>
                        <Box
                            component="span"
                            sx={{
                                fontSize: 9,
                                fontWeight: 700,
                                letterSpacing: 0.4,
                                textTransform: 'uppercase',
                                lineHeight: 1,
                            }}
                        >
                            {t(item.labelKey)}
                        </Box>
                    </Box>
                );
            })}
        </Box>
    );
}
