import { useEffect, useState } from 'react';

import { Box } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';

import {
  HOME_HERO_FADE_MS,
  HOME_HERO_ROTATE_MS,
  HOME_HERO_SLIDES,
} from './hero-slides';

// ----------------------------------------------------------------------
// LCP-critical: CSS only, fixed box, WebP, first slide only in DOM
// (HTML boot-shell owns early LCP; this remounts after shell dismisses)

const heroKenBurns = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.015); }
  100% { transform: scale(1); }
`;

const GOLD = '#f5c518';

export function HeroRotatingBanner() {
  const [activeIndex, setActiveIndex] = useState(0);
  /** Only mount slides that have been shown — never idle-prefetch all (LCP bandwidth) */
  const [mounted, setMounted] = useState<ReadonlySet<number>>(() => new Set([0]));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % HOME_HERO_SLIDES.length;
        setMounted((m) => {
          if (m.has(next)) return m;
          const copy = new Set(m);
          copy.add(next);
          return copy;
        });
        return next;
      });
    }, HOME_HERO_ROTATE_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  return (
    <>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          width: 1,
          height: 1,
          overflow: 'hidden',
          bgcolor: '#000',
        }}
      >
        {HOME_HERO_SLIDES.map((slide, index) => {
          if (!mounted.has(index)) return null;

          const isActive = index === activeIndex;

          return (
            <Box
              key={slide.key}
              component="img"
              src={slide.src}
              alt={slide.label}
              width={slide.width}
              height={slide.height}
              loading={index === 0 ? 'eager' : 'lazy'}
              fetchPriority={index === 0 ? 'high' : 'low'}
              decoding="async"
              sx={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center center',
                opacity: isActive ? 1 : 0,
                transition: `opacity ${HOME_HERO_FADE_MS}ms ease-in-out`,
                animation: isActive
                  ? {
                      xs: 'none',
                      md: `${heroKenBurns} 40s ease-in-out infinite`,
                    }
                  : 'none',
                '@media (prefers-reduced-motion: reduce)': {
                  animation: 'none',
                  transition: 'opacity 0.3s ease',
                },
              }}
            />
          );
        })}
      </Box>

      <Box
        role="tablist"
        aria-label="Hero slides"
        sx={{
          position: 'absolute',
          zIndex: 2,
          bottom: { xs: 18, md: 28 },
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 1,
          px: 1.25,
          py: 0.75,
          minHeight: 22,
          borderRadius: 999,
          bgcolor: alpha('#000000', 0.28),
          border: `1px solid ${alpha('#ffffff', 0.1)}`,
        }}
      >
        {HOME_HERO_SLIDES.map((slide, index) => (
          <Box
            key={slide.key}
            role="tab"
            aria-selected={index === activeIndex}
            tabIndex={0}
            aria-label={slide.label}
            onClick={() => {
              setMounted((m) => {
                if (m.has(index)) return m;
                const copy = new Set(m);
                copy.add(index);
                return copy;
              });
              setActiveIndex(index);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setMounted((m) => {
                  if (m.has(index)) return m;
                  const copy = new Set(m);
                  copy.add(index);
                  return copy;
                });
                setActiveIndex(index);
              }
            }}
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              cursor: 'pointer',
              bgcolor: index === activeIndex ? GOLD : alpha('#ffffff', 0.35),
              transition: 'background-color 0.25s ease',
            }}
          />
        ))}
      </Box>
    </>
  );
}
