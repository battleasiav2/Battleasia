import { useEffect, useState } from 'react';

import { Box } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';

import {
  HOME_HERO_FADE_MS,
  HOME_HERO_ROTATE_MS,
  HOME_HERO_SLIDES,
} from './hero-slides';

// ----------------------------------------------------------------------
// LCP-critical: CSS only, fixed box, WebP, first slide only eager

const heroKenBurns = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.015); }
  100% { transform: scale(1); }
`;

const GOLD = '#f5c518';

export function HeroRotatingBanner() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % HOME_HERO_SLIDES.length);
    }, HOME_HERO_ROTATE_MS);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          // Stable LCP/CLS box — matches parent section heights
          width: 1,
          height: 1,
          overflow: 'hidden',
          bgcolor: '#000',
        }}
      >
        {HOME_HERO_SLIDES.map((slide, index) => {
          const isActive = index === activeIndex;
          // Only mount first slide immediately; others after first paint cycle
          if (index > 0 && activeIndex === 0 && index !== activeIndex) {
            // still render but lazy — browser won't fetch until near
          }

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
                // Desktop-only subtle motion; avoid will-change on inactive
                animation:
                  isActive
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
            onClick={() => setActiveIndex(index)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') setActiveIndex(index);
            }}
            sx={{
              width: index === activeIndex ? 22 : 8,
              height: 8,
              flexShrink: 0,
              borderRadius: 999,
              bgcolor: index === activeIndex ? GOLD : alpha('#ffffff', 0.35),
              transition: 'width 0.35s ease, background-color 0.35s ease',
              cursor: 'pointer',
            }}
          />
        ))}
      </Box>
    </>
  );
}
