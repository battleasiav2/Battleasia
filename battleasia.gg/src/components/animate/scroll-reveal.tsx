import type { BoxProps } from '@mui/material/Box';
import type { Theme, SxProps } from '@mui/material/styles';

import { useRef, useState, useEffect, forwardRef } from 'react';

import Box from '@mui/material/Box';

// ----------------------------------------------------------------------

export type ScrollRevealPreset = 'soft' | 'cinematic' | 'cinematic-slide-left' | 'cinematic-slide-right';

export type ScrollRevealProps = BoxProps & {
  direction?: 'in' | 'inUp' | 'inDown' | 'inLeft' | 'inRight';
  preset?: ScrollRevealPreset;
  stagger?: boolean;
  amount?: number;
  distance?: number;
  disabled?: boolean;
  repeat?: boolean;
  /** Full-viewport section — PUBG Mobile panel feel */
  fullViewport?: boolean;
  sx?: SxProps<Theme>;
};

function resolveTransform(
  visible: boolean,
  direction: ScrollRevealProps['direction'],
  enterDir: 'fromBottom' | 'fromTop',
  distance: number
) {
  if (visible) return 'translate3d(0, 0, 0) scale(1)';
  if (direction === 'inLeft') return `translate3d(-${distance}px, 0, 0)`;
  if (direction === 'inRight') return `translate3d(${distance}px, 0, 0)`;
  if (direction === 'inDown' || enterDir === 'fromTop') return `translate3d(0, -${distance}px, 0) scale(0.985)`;
  return `translate3d(0, ${distance}px, 0) scale(0.985)`;
}

/**
 * Scroll-into-view reveal — CSS + IntersectionObserver only (no framer-motion on critical path).
 * Smoothly reveals contents when scrolling down and when scrolling up.
 */
export const ScrollReveal = forwardRef<HTMLDivElement, ScrollRevealProps>((props, ref) => {
  const {
    children,
    direction = 'inUp',
    preset = 'soft',
    stagger = false,
    amount = preset.startsWith('cinematic') ? 0.08 : 0.1,
    distance = preset.startsWith('cinematic') ? 36 : 26,
    disabled = false,
    repeat = true,
    fullViewport = false,
    sx,
    ...other
  } = props;

  const localRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(disabled);
  const [enterDirection, setEnterDirection] = useState<'fromBottom' | 'fromTop'>('fromBottom');
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
        if (!entry) return;
        if (entry.isIntersecting) {
          if (entry.boundingClientRect.top > 0) {
            setEnterDirection('fromBottom');
          } else {
            setEnterDirection('fromTop');
          }
          setVisible(true);
          if (!repeat) {
            observer.disconnect();
          }
        } else if (repeat) {
          setVisible(false);
        }
      },
      { threshold: amount, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [amount, disabled, reduceMotion, repeat]);

  const isVisible = visible || reduceMotion || disabled;

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
      opacity: isVisible ? 1 : 0,
      transform: resolveTransform(isVisible, direction, enterDirection, distance),
      transition: isVisible
        ? 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)'
        : 'opacity 0.35s ease-out, transform 0.35s ease-out',
      willChange: 'opacity, transform',
      '@media (prefers-reduced-motion: reduce)': {
        opacity: 1,
        transform: 'none',
        transition: 'none',
      },
      ...(stagger
        ? {
            '& > *': {
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translate3d(0, 0, 0)' : 'translate3d(0, 20px, 0)',
              transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
              willChange: 'opacity, transform',
            },
            '& > *:nth-of-type(1)': { transitionDelay: '0ms' },
            '& > *:nth-of-type(2)': { transitionDelay: '80ms' },
            '& > *:nth-of-type(3)': { transitionDelay: '160ms' },
            '& > *:nth-of-type(4)': { transitionDelay: '240ms' },
            '& > *:nth-of-type(5)': { transitionDelay: '320ms' },
            '& > *:nth-of-type(6)': { transitionDelay: '400ms' },
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
