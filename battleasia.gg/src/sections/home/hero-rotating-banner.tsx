import { useEffect, useState } from 'react';

import { Box } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';

import {
  HOME_HERO_FADE_MS,
  HOME_HERO_ROTATE_MS,
  HOME_HERO_SLIDES,
} from './hero-slides';

// ----------------------------------------------------------------------
// LCP-critical: CSS animations only — no framer-motion / ScrollParallax

const heroKenBurns = keyframes`
  0% { transform: scale(1) translate3d(0.4%, 0.2%, 0); }
  40% { transform: scale(1.02) translate3d(-0.4%, -0.3%, 0); }
  75% { transform: scale(1.01) translate3d(-0.6%, 0.2%, 0); }
  100% { transform: scale(1) translate3d(0.4%, 0.2%, 0); }
`;

const heroEnter = keyframes`
  0% { transform: scale(1.03) translate3d(0, 0.4%, 0); opacity: 0.55; }
  100% { transform: scale(1) translate3d(0, 0, 0); opacity: 1; }
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
          // Fixed hero box prevents CLS while images load
          minHeight: { xs: 520, md: 720 },
        }}
      >
        {HOME_HERO_SLIDES.map((slide, index) => {
          const isActive = index === activeIndex;

          return (
            <Box
              key={slide.key}
              component="img"
              src={slide.src}
              alt={slide.label}
              width={1920}
              height={1080}
              loading={index === 0 ? 'eager' : 'lazy'}
              fetchPriority={index === 0 ? 'high' : 'auto'}
              decoding="async"
              sx={{
                position: 'absolute',
                inset: 0,
                width: 1,
                height: 1,
                objectFit: 'cover',
                objectPosition: 'center center',
                transformOrigin: 'center center',
                imageRendering: 'auto',
                backfaceVisibility: 'hidden',
                opacity: isActive ? 1 : 0,
                transition: `opacity ${HOME_HERO_FADE_MS}ms ease-in-out`,
                animation: isActive
                  ? {
                      xs: `${heroEnter} 1.2s cubic-bezier(0.22, 1, 0.36, 1) both`,
                      md: `${heroEnter} 1.5s cubic-bezier(0.22, 1, 0.36, 1) both, ${heroKenBurns} 32s 1.5s ease-in-out infinite`,
                    }
                  : 'none',
                willChange: isActive ? 'transform, opacity' : 'opacity',
                '@media (prefers-reduced-motion: reduce)': {
                  animation: 'none',
                  transform: 'none',
                  transition: 'opacity 0.4s ease',
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
          borderRadius: 999,
          bgcolor: alpha('#000000', 0.28),
          border: `1px solid ${alpha('#ffffff', 0.1)}`,
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
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
