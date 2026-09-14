import type { MenuItem } from '../menu-items-config';

import { useState, useEffect, useCallback, useRef } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { paths } from 'src/routes/paths';
import { useTranslate } from 'src/locales';
import { RouterLink } from 'src/routes/components';
import { usePathname, useRouter } from 'src/routes/hooks';

import { menuItems } from '../menu-items-config';
import { LANDING_V2 } from 'src/sections/home/landing-v2-theme';

// ----------------------------------------------------------------------

const SCROLL_TARGETS = ['home', 'about-us', 'how-to-play', 'rules'];

const DEFAULT_NAV_LABELS: Record<string, string> = {
  'navigation.home': 'HOME',
  'navigation.aboutUs': 'ABOUT US',
  'navigation.howToPlay': 'HOW TO PLAY',
  'navigation.rules': 'RULES',
};

export function HeaderNav() {
  const { t } = useTranslate();
  const pathname = usePathname();
  const router = useRouter();

  const isHomeRoute =
    pathname === paths.dashboard.root || pathname === '/dashboard/' || pathname === '/';

  const [activeTarget, setActiveTarget] = useState<string>('home');
  const isClickScrolling = useRef(false);
  const clickTimeoutRef = useRef<number | null>(null);

  const handleScroll = useCallback(() => {
    if (!isHomeRoute || isClickScrolling.current) return;

    const scrollY = window.scrollY || window.pageYOffset;

    if (scrollY < 180) {
      setActiveTarget('home');
      return;
    }

    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;
    if (scrollY + clientHeight >= scrollHeight - 80) {
      setActiveTarget('rules');
      return;
    }

    const headerOffsetThreshold = 180;
    let current = 'home';

    for (const id of SCROLL_TARGETS) {
      const el = document.getElementById(id);
      if (el) {
        const top = el.getBoundingClientRect().top;
        if (top <= headerOffsetThreshold) {
          current = id;
        }
      }
    }

    setActiveTarget(current);
  }, [isHomeRoute]);

  useEffect(() => {
    if (!isHomeRoute) return undefined;

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (clickTimeoutRef.current) {
        window.clearTimeout(clickTimeoutRef.current);
      }
    };
  }, [handleScroll, isHomeRoute]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, item: MenuItem) => {
    if (item.scrollTarget) {
      e.preventDefault();

      setActiveTarget(item.scrollTarget);
      isClickScrolling.current = true;

      if (clickTimeoutRef.current) {
        window.clearTimeout(clickTimeoutRef.current);
      }
      clickTimeoutRef.current = window.setTimeout(() => {
        isClickScrolling.current = false;
      }, 850);

      const scrollToSection = (targetId: string) => {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          const headerOffset = 72;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          });
        }
      };

      if (!isHomeRoute) {
        router.push(paths.dashboard.root);

        let attempts = 0;
        const maxAttempts = 25;
        const tryScroll = () => {
          attempts += 1;
          const targetElement = document.getElementById(item.scrollTarget);
          if (targetElement) {
            scrollToSection(item.scrollTarget);
          } else if (attempts < maxAttempts) {
            setTimeout(tryScroll, 80);
          }
        };
        setTimeout(tryScroll, 100);
      } else {
        scrollToSection(item.scrollTarget);
      }
    }
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        display: { xs: 'none', lg: 'flex' },
        height: '100%',
        gap: 0.25,
        ml: 1,
      }}
    >
      {menuItems.map((item) => {
        const isActive = isHomeRoute
          ? activeTarget === (item.scrollTarget || 'home')
          : item.isActive(pathname);

        const rawTranslated = t(item.labelKey);
        const displayLabel =
          !rawTranslated || rawTranslated === item.labelKey
            ? (DEFAULT_NAV_LABELS[item.labelKey] ?? item.labelKey)
            : rawTranslated;

        return (
          <Box
            key={item.href}
            component={RouterLink}
            href={item.href}
            onClick={(e: React.MouseEvent<HTMLAnchorElement>) => handleNavClick(e, item)}
            sx={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              minHeight: 44,
              px: 1.75,
              py: 1.25,
              borderRadius: '9px',
              textDecoration: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.76rem',
              letterSpacing: '0.11em',
              textTransform: 'uppercase',
              color: isActive ? LANDING_V2.text : LANDING_V2.muted,
              transition: `color 0.25s ${LANDING_V2.ease}`,
              whiteSpace: 'nowrap',
              '&:hover': { color: LANDING_V2.text },
              '&::after': {
                content: '""',
                position: 'absolute',
                left: 14,
                right: 14,
                bottom: 7,
                height: '1.5px',
                borderRadius: '2px',
                bgcolor: isActive ? 'var(--ba-gold)' : 'transparent',
              },
            }}
          >
            {displayLabel}
          </Box>
        );
      })}
    </Stack>
  );
}
