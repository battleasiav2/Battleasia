import { useEffect, useState } from 'react';

import { Box } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';

import { ScrollParallax } from 'src/components/animate';

import {
  HOME_HERO_FADE_MS,
  HOME_HERO_ROTATE_MS,
  HOME_HERO_SLIDES,
} from './hero-slides';

// ----------------------------------------------------------------------

const heroKenBurns = keyframes`
  0% { transform: scale(1.08) translate3d(1.2%, 0.6%, 0); }
  40% { transform: scale(1.12) translate3d(-1.2%, -0.8%, 0); }
  75% { transform: scale(1.07) translate3d(-2%, 0.4%, 0); }
  100% { transform: scale(1.08) translate3d(1.2%, 0.6%, 0); }
`;

const heroEnter = keyframes`
  0% { transform: scale(1.18) translate3d(0, 1.5%, 0); opacity: 0.55; }
  100% { transform: scale(1.08) translate3d(1.2%, 0.6%, 0); opacity: 1; }
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
      <ScrollParallax offset={80} scaleRange={[1.06, 1, 1.04]} sx={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        {HOME_HERO_SLIDES.map((slide, index) => {
          const isActive = index === activeIndex;

          return (
            <Box
              key={slide.key}
              component="img"
              src={slide.src}
              alt={slide.label}
              loading={index === 0 ? 'eager' : 'lazy'}
              fetchPriority={index === 0 ? 'high' : 'auto'}
              decoding="async"
              sx={{
                position: 'absolute',
                inset: 0,
                width: 1,
                height: 1,
                objectFit: 'cover',
                objectPosition: {
                  xs: '50% 22%',
                  sm: '48% 24%',
                  md: '36% center',
                  lg: '32% center',
                },
                transformOrigin: 'center center',
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
      </ScrollParallax>

      {/* Slide dots */}
      <Box
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
          bgcolor: alpha('#000000', 0.35),
          border: `1px solid ${alpha('#ffffff', 0.12)}`,
          backdropFilter: 'blur(8px)',
        }}
      >
        {HOME_HERO_SLIDES.map((slide, index) => (
          <Box
            key={slide.key}
            role="button"
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
