import { Box, alpha } from '@mui/material';

import { usePathname, useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useTranslate } from 'src/locales';
import { Iconify } from 'src/components/iconify';
import { GLASS_CARD_RADIUS } from 'src/components/battle-glass-card';

import { menuItems, createMenuClickHandler, type MenuItem } from '../menu-items-config';

// ----------------------------------------------------------------------

const GOLD = '#f5c518';

const NAV_ICONS: Record<string, string> = {
  home: 'solar:home-2-bold',
  'about-us': 'solar:info-circle-bold',
  'how-to-play': 'solar:gamepad-bold',
  rules: 'solar:document-text-bold',
};

function getNavIcon(item: MenuItem) {
  const key = item.scrollTarget || 'home';
  return NAV_ICONS[key] || 'solar:menu-dots-bold';
}

// ----------------------------------------------------------------------

export function PublicMobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslate();
  const handleMenuClick = createMenuClickHandler(pathname, router);

  return (
    <Box
      sx={{
        display: { xs: 'flex', lg: 'none' },
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
        bgcolor: alpha('#000000', 0.72),
        border: `1px solid ${alpha('#ffffff', 0.1)}`,
        boxShadow: `0 12px 36px ${alpha('#000000', 0.55)}, inset 0 1px 0 ${alpha('#ffffff', 0.06)}`,
        backdropFilter: 'blur(10px) saturate(1.15)',
        WebkitBackdropFilter: 'blur(10px) saturate(1.15)',
      }}
    >
      {menuItems.map((item) => {
        const isActive = item.isActive(pathname);

        return (
          <Box
            key={item.href}
            component={RouterLink}
            href={item.href}
            onClick={(e) => handleMenuClick(e as React.MouseEvent<HTMLAnchorElement>, item)}
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
              color: isActive ? GOLD : alpha('#ffffff', 0.55),
              bgcolor: isActive ? alpha(GOLD, 0.1) : 'transparent',
              border: `1px solid ${isActive ? alpha(GOLD, 0.25) : 'transparent'}`,
              '&:hover': {
                color: GOLD,
                bgcolor: alpha(GOLD, 0.07),
              },
            }}
          >
            <Iconify icon={getNavIcon(item)} width={20} />
            <Box
              component="span"
              sx={{
                fontSize: 9.5,
                fontWeight: 700,
                letterSpacing: 0.02,
                textTransform: 'uppercase',
                lineHeight: 1,
                textAlign: 'center',
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
