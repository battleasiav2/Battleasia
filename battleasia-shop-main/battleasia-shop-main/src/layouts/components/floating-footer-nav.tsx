import { useMemo } from 'react';

import { Box, alpha } from '@mui/material';

import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { GLASS_CARD_RADIUS } from 'src/components/battle-glass-card';
import { USER_COLORS } from 'src/layouts/user/user-theme';

import { accountMenuItems } from '../menu-items-config';

// ----------------------------------------------------------------------

type NavItem = {
    label: string;
    href: string;
    icon: React.ReactNode;
    isActive: (pathname: string) => boolean;
};

// ----------------------------------------------------------------------

export function FloatingFooterNav() {
    const pathname = usePathname();

    const navItems: NavItem[] = useMemo(() => accountMenuItems
        .filter((item) => item.mobileMenu === true && item.href)
        .map((item) => ({
            label: item.label,
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
                boxShadow: `0 12px 40px ${alpha('#000000', 0.55)}`,
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
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
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textDecoration: 'none',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            cursor: 'pointer',
                            flex: isActive ? 1.4 : 1,
                            ...(isActive
                                ? {
                                    bgcolor: alpha(USER_COLORS.gold, 0.18),
                                    color: USER_COLORS.gold,
                                    borderRadius: `${GLASS_CARD_RADIUS}px`,
                                    px: 1.5,
                                    py: 1,
                                    gap: 0.5,
                                    border: `1px solid ${alpha(USER_COLORS.gold, 0.35)}`,
                                }
                                : {
                                    py: 1,
                                    borderRadius: `${GLASS_CARD_RADIUS}px`,
                                    color: alpha('#ffffff', 0.55),
                                    '&:hover': {
                                        bgcolor: alpha('#ffffff', 0.06),
                                        color: alpha('#ffffff', 0.85),
                                    },
                                }),
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: isActive ? 18 : 22,
                                height: isActive ? 18 : 22,
                                '& svg': {
                                    width: isActive ? 18 : 22,
                                    height: isActive ? 18 : 22,
                                    color: 'inherit',
                                },
                            }}
                        >
                            {item.icon}
                        </Box>
                        {isActive && (
                            <Box
                                component="span"
                                sx={{
                                    fontSize: 11,
                                    fontWeight: 700,
                                    whiteSpace: 'nowrap',
                                    lineHeight: 1,
                                }}
                            >
                                {item.label}
                            </Box>
                        )}
                    </Box>
                );
            })}
        </Box>
    );
}
