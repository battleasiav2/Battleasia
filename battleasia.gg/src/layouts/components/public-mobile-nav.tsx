import { Box } from '@mui/material';

import { usePathname, useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useTranslate } from 'src/locales';
import { Iconify } from 'src/components/iconify';
import { LANDING_V2 } from 'src/sections/home/landing-v2-theme';
import { goldAlpha } from 'src/theme/accent-presets';

import { menuItems, createMenuClickHandler, type MenuItem } from '../menu-items-config';

// ----------------------------------------------------------------------

const GOLD = 'var(--ba-gold)';

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

function getMobileLabel(item: MenuItem, t: (key: string) => string) {
  const key = item.scrollTarget || 'home';
  if (key === 'how-to-play') {
    const short = t('navigation.howToPlayShort');
    return short === 'navigation.howToPlayShort' ? 'GUIDE' : short;
  }
  if (key === 'about-us') {
    const short = t('navigation.aboutUsShort');
    return short === 'navigation.aboutUsShort' ? 'ABOUT' : short;
  }
  return t(item.labelKey);
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
        gap: 0.25,
        px: 0.75,
        pt: 1.1,
        pb: 'max(10px, env(safe-area-inset-bottom))',
        bgcolor: 'rgba(6,6,7,0.94)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        border: 'none',
        boxShadow: 'none',
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: '1px',
          pointerEvents: 'none',
          background: `linear-gradient(90deg, transparent, ${goldAlpha(0.24)} 18%, ${goldAlpha(0.24)} 82%, transparent)`,
        },
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
              gap: 0.45,
              minHeight: 52,
              py: 0.65,
              px: 0.25,
              textDecoration: 'none',
              transition: `color 0.25s ${LANDING_V2.ease}`,
              color: isActive ? LANDING_V2.text : LANDING_V2.muted,
              '&:hover': { color: LANDING_V2.text },
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <Iconify icon={getNavIcon(item)} width={20} />
            <Box
              component="span"
              sx={{
                fontFamily: LANDING_V2.display,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.11em',
                textTransform: 'uppercase',
                lineHeight: 1.1,
                textAlign: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
                px: 0.25,
              }}
            >
              {getMobileLabel(item, t)}
            </Box>
            <Box
              sx={{
                mt: 0.15,
                height: '1.5px',
                width: isActive ? 24 : 0,
                bgcolor: GOLD,
                borderRadius: '2px',
                transition: `width 0.25s ${LANDING_V2.ease}`,
                boxShadow: 'none',
              }}
            />
          </Box>
        );
      })}
    </Box>
  );
}
