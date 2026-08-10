import type { BoxProps } from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';

import { forwardRef, useEffect, useRef, useState } from 'react';

import Box from '@mui/material/Box';
import { keyframes } from '@mui/material/styles';

// ----------------------------------------------------------------------

export type ScrollRevealPreset = 'soft' | 'cinematic' | 'cinematic-slide-left' | 'cinematic-slide-right';

export type ScrollRevealProps = BoxProps & {
  direction?: 'in' | 'inUp' | 'inDown' | 'inLeft' | 'inRight';
  preset?: ScrollRevealPreset;
  stagger?: boolean;
  amount?: number;
  distance?: number;
  disabled?: boolean;
  /** Full-viewport section — PUBG Mobile panel feel */
  fullViewport?: boolean;
  sx?: SxProps<Theme>;
};

const revealUp = keyframes`
  from { opacity: 0; transform: translate3d(0, var(--ba-reveal-y, 28px), 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
`;

const revealLeft = keyframes`
  from { opacity: 0; transform: translate3d(calc(var(--ba-reveal-y, 28px) * -1), 0, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
`;

const revealRight = keyframes`
  from { opacity: 0; transform: translate3d(var(--ba-reveal-y, 28px), 0, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
`;

function resolveAnimation(preset: ScrollRevealPreset, direction: ScrollRevealProps['direction']) {
  if (preset === 'cinematic-slide-left' || direction === 'inLeft') return `${revealLeft} 0.55s ease both`;
  if (preset === 'cinematic-slide-right' || direction === 'inRight') return `${revealRight} 0.55s ease both`;
  return `${revealUp} 0.55s ease both`;
}

/**
 * Scroll-into-view reveal — CSS + IntersectionObserver only (no framer-motion on critical path).
 */
export const ScrollReveal = forwardRef<HTMLDivElement, ScrollRevealProps>((props, ref) => {
  const {
    children,
    direction = 'inUp',
    preset = 'soft',
    stagger = false,
    amount = preset.startsWith('cinematic') ? 0.14 : 0.18,
    distance = preset.startsWith('cinematic') ? 48 : 28,
    disabled = false,
    fullViewport = false,
    sx,
    ...other
  } = props;

  const localRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(disabled);
  const reduceMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (disabled || reduceMotion) {
      setVisible(true);
      return undefined;
    }
    const node = localRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: amount, rootMargin: '0px 0px -8% 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [amount, disabled, reduceMotion]);

  const sectionSx: SxProps<Theme> = [
    fullViewport && {
      minHeight: { xs: 'auto', md: '100vh' },
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      scrollSnapAlign: 'start',
      scrollSnapStop: 'normal',
    },
    {
      '--ba-reveal-y': `${distance}px`,
      opacity: visible || reduceMotion || disabled ? 1 : 0,
      animation: visible && !reduceMotion && !disabled ? resolveAnimation(preset, direction) : 'none',
      '@media (prefers-reduced-motion: reduce)': {
        opacity: 1,
        animation: 'none',
      },
      ...(stagger
        ? {
            '& > *': {
              opacity: visible ? 1 : 0,
              animation: visible && !reduceMotion ? `${revealUp} 0.45s ease both` : 'none',
            },
            '& > *:nth-of-type(1)': { animationDelay: '0ms' },
            '& > *:nth-of-type(2)': { animationDelay: '60ms' },
            '& > *:nth-of-type(3)': { animationDelay: '120ms' },
            '& > *:nth-of-type(4)': { animationDelay: '180ms' },
            '& > *:nth-of-type(5)': { animationDelay: '240ms' },
            '& > *:nth-of-type(6)': { animationDelay: '300ms' },
          }
        : null),
    },
    ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
  ];

  return (
    <Box
      ref={(node: HTMLDivElement | null) => {
        localRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      sx={sectionSx}
      {...other}
    >
      {children}
    </Box>
  );
});

ScrollReveal.displayName = 'ScrollReveal';

/** Stagger child — plain box (parent ScrollReveal handles stagger delays). */
export const ScrollRevealItem = forwardRef<HTMLDivElement, BoxProps>((props, ref) => {
  const { children, sx, ...other } = props;
  return (
    <Box ref={ref} sx={sx} {...other}>
      {children}
    </Box>
  );
});

ScrollRevealItem.displayName = 'ScrollRevealItem';
