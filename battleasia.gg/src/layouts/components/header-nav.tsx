import type { MenuItem } from '../menu-items-config';

import { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { paths } from 'src/routes/paths';
import { useTranslate } from 'src/locales';
import { RouterLink } from 'src/routes/components';
import { usePathname, useRouter } from 'src/routes/hooks';

import { menuItems } from '../menu-items-config';
import { headerNavDividerSx } from './header-chrome';

// ----------------------------------------------------------------------

const SCROLL_TARGETS = ['home', 'about-us', 'how-to-play', 'rules'];

const DEFAULT_NAV_LABELS: Record<string, string> = {
  'navigation.home': 'HOME',
  'navigation.aboutUs': 'ABOUT US',
  'navigation.howToPlay': 'HOW TO PLAY',
  'navigation.rules': 'RULES',
};

type IndicatorPosition = {
  left: number;
  width: number;
  ready: boolean;
};

export function HeaderNav() {
  const { t, i18n, currentLang } = useTranslate();
  const pathname = usePathname();
  const router = useRouter();

  const isHomeRoute =
    pathname === paths.dashboard.root || pathname === '/dashboard/' || pathname === '/';

  const [activeTarget, setActiveTarget] = useState<string>('home');
  const [indicator, setIndicator] = useState<IndicatorPosition>({
    left: 0,
    width: 0,
    ready: false,
  });

  const navContainerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const isClickScrolling = useRef(false);
  const clickTimeoutRef = useRef<number | null>(null);
  const isMounted = useRef(false);

  // Active item index
  const activeIndex = menuItems.findIndex((item) =>
    isHomeRoute ? activeTarget === (item.scrollTarget || 'home') : item.isActive(pathname)
  );
  const resolvedIndex = activeIndex >= 0 ? activeIndex : 0;

  // Measure and position the sliding indicator
  const updateIndicatorPosition = useCallback(() => {
    const container = navContainerRef.current;
    const targetItem = itemRefs.current[resolvedIndex];

    if (!container || !targetItem) return;

    const containerRect = container.getBoundingClientRect();
    const itemRect = targetItem.getBoundingClientRect();

    if (itemRect.width === 0 || containerRect.width === 0) return;

    const left = itemRect.left - containerRect.left;
    const width = itemRect.width;

    setIndicator((prev) => {
      if (
        prev.ready &&
        Math.abs(prev.left - left) < 0.5 &&
        Math.abs(prev.width - width) < 0.5
      ) {
        return prev;
      }
      return {
        left,
        width,
        ready: true,
      };
    });
  }, [resolvedIndex]);

  // Update indicator whenever active target or language changes
  useLayoutEffect(() => {
    updateIndicatorPosition();
  }, [updateIndicatorPosition, currentLang?.value, t]);

  // Handle resize, element size reflows, font loading, and i18n completion to keep indicator aligned
  useEffect(() => {
    updateIndicatorPosition();

    // ResizeObserver: precisely watches any layout/font/text changes on container or items
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        updateIndicatorPosition();
      });

      if (navContainerRef.current) {
        ro.observe(navContainerRef.current);
      }
      itemRefs.current.forEach((el) => {
        if (el) ro?.observe(el);
      });
    }

    // Font readiness and dynamic font loading events
    const handleFontDone = () => {
      updateIndicatorPosition();
    };
    if (document.fonts) {
      document.fonts.ready.then(updateIndicatorPosition);
      document.fonts.addEventListener?.('loadingdone', handleFontDone);
    }

    // i18n resource loading events (network fetch completion & language swap)
    const handleI18nChange = () => {
      updateIndicatorPosition();
    };
    i18n.on('loaded', handleI18nChange);
    i18n.on('languageChanged', handleI18nChange);

    // Window resize
    const handleResize = () => {
      updateIndicatorPosition();
    };
    window.addEventListener('resize', handleResize);

    // Staggered frames for cold-load settling
    const rafId = requestAnimationFrame(updateIndicatorPosition);
    const t1 = setTimeout(updateIndicatorPosition, 50);
    const t2 = setTimeout(updateIndicatorPosition, 150);
    const t3 = setTimeout(() => {
      isMounted.current = true;
      updateIndicatorPosition();
    }, 280);

    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', handleResize);
      if (document.fonts?.removeEventListener) {
        document.fonts.removeEventListener('loadingdone', handleFontDone);
      }
      i18n.off('loaded', handleI18nChange);
      i18n.off('languageChanged', handleI18nChange);
      cancelAnimationFrame(rafId);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [updateIndicatorPosition, i18n]);

  // Scrollspy: detect active section when scrolling
  const handleScroll = useCallback(() => {
    if (!isHomeRoute || isClickScrolling.current) return;

    const scrollY = window.scrollY || window.pageYOffset;

    // Near the top of the page -> 'home'
    if (scrollY < 180) {
      setActiveTarget('home');
      return;
    }

    // Near the bottom of the page -> last section ('rules')
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;
    if (scrollY + clientHeight >= scrollHeight - 80) {
      setActiveTarget('rules');
      return;
    }

    // Check positions of all sections
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

  // Click handler with smooth scroll
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, item: MenuItem) => {
    if (item.scrollTarget) {
      e.preventDefault();

      // Immediately set active target so badge slides instantly
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
          const headerOffset = 56;
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
    <Box
      ref={navContainerRef}
      sx={{
        position: 'relative',
        display: { xs: 'none', lg: 'flex' },
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
      }}
    >
      {/* 
        Single continuous sliding active indicator:
        Physically glides left-to-right and right-to-left using GPU transform.
      */}
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: indicator.width > 0 ? `${indicator.width}px` : '128px',
          transform: `translate3d(${indicator.left}px, 0, 0)`,
          transition: isMounted.current
            ? 'transform 0.38s cubic-bezier(0.22, 1, 0.36, 1), width 0.38s cubic-bezier(0.22, 1, 0.36, 1)'
            : 'none',
          zIndex: 1,
          pointerEvents: 'none',
          clipPath:
            'polygon(0 0, 100% 0, calc(100% - 26px) 100%, calc(50% + 8px) 100%, 50% calc(100% - 7px), calc(50% - 8px) 100%, 26px 100%)',
          background:
            'linear-gradient(180deg, var(--ba-nav-badge-light, #e2ff58) 0%, var(--ba-nav-badge-main, #cbfb24) 100%)',
          opacity: activeIndex >= 0 && indicator.ready ? 1 : 0,
          boxShadow: 'none',
          filter: 'none',
        }}
      />

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        sx={{
          height: '100%',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {menuItems.map((item, index) => {
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
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                height: '100%',
              }}
            >
              {index > 0 && <Box sx={headerNavDividerSx} />}
              <Box
                ref={(el: HTMLElement | null) => {
                  itemRefs.current[index] = el;
                }}
                component={RouterLink}
                href={item.href}
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => handleNavClick(e, item)}
                sx={{
                  position: 'relative',
                  height: '100%',
                  minWidth: { xs: 120, lg: 126, xl: 138 },
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  px: { lg: 2.75, xl: 3.5 },
                }}
              >
                <span
                  className="nav-label"
                  style={{
                    position: 'relative',
                    zIndex: 3,
                    fontFamily: "'Barlow', sans-serif",
                    fontWeight: isActive ? 800 : 600,
                    fontSize: isActive ? '14px' : '13.5px',
                    letterSpacing: '1.2px',
                    textTransform: 'uppercase',
                    color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.68)',
                    textShadow: isActive ? '0 1px 3px rgba(0, 0, 0, 0.45)' : 'none',
                    transition: 'color 0.22s ease, text-shadow 0.22s ease',
                    whiteSpace: 'nowrap',
                    lineHeight: 1,
                  }}
                >
                  {displayLabel}
                </span>
              </Box>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}
