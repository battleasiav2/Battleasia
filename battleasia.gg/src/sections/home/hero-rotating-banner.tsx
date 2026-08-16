import { useEffect, useState } from 'react';

import { Box } from '@mui/material';
import { keyframes } from '@mui/material/styles';

import {
  HOME_HERO_FADE_MS,
  HOME_HERO_ROTATE_MS,
  HOME_HERO_SLIDES,
  readHeroSlideIndex,
  writeHeroSlideIndex,
} from './hero-slides';

// ----------------------------------------------------------------------
// LCP-critical: CSS only, fixed box, WebP, restore last slide from sessionStorage
// (HTML boot-shell owns early LCP; this remounts after shell dismisses)

const heroKenBurns = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.015); }
  100% { transform: scale(1); }
`;

export function HeroRotatingBanner() {
  const [activeIndex, setActiveIndex] = useState(readHeroSlideIndex);
  /** Only mount slides that have been shown — never idle-prefetch all (LCP bandwidth) */
  const [mounted, setMounted] = useState<ReadonlySet<number>>(
    () => new Set([readHeroSlideIndex()])
  );

  useEffect(() => {
    writeHeroSlideIndex(activeIndex);
  }, [activeIndex]);

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
            loading={isActive ? 'eager' : 'lazy'}
            fetchPriority={isActive ? 'high' : 'low'}
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
  );
}
