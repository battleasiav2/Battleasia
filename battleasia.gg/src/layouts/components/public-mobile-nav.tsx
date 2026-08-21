import { Box, alpha } from '@mui/material';

import { usePathname, useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useTranslate } from 'src/locales';
import { Iconify } from 'src/components/iconify';

import { menuItems, createMenuClickHandler, type MenuItem } from '../menu-items-config';

// ----------------------------------------------------------------------

const GOLD = '#f5c518';

const NAV_ICONS: Record<string, string> = {
  home: 'solar:home-2-bold',
  'about-us': 'solar:users-group-rounded-bold',
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
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1300,
        alignItems: 'stretch',
        justifyContent: 'space-between',
        px: 0.5,
        pt: 1,
        pb: 'max(8px, env(safe-area-inset-bottom))',
        bgcolor: alpha('#141414', 0.96),
        borderTop: `1px solid ${alpha(GOLD, 0.28)}`,
        boxShadow: `0 -8px 24px ${alpha('#000000', 0.45)}`,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
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
              gap: 0.4,
              py: 0.5,
              textDecoration: 'none',
              transition: 'color 0.2s ease',
              color: isActive ? GOLD : '#9CA3AF',
              '&:hover': { color: GOLD },
            }}
          >
            <Iconify icon={getNavIcon(item)} width={20} />
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
                boxShadow: isActive ? `0 0 6px ${alpha(GOLD, 0.55)}` : 'none',
              }}
            />
          </Box>
        );
      })}
    </Box>
  );
}
