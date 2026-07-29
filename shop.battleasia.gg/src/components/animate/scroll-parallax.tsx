import type { ReactNode } from 'react';
import type { BoxProps } from '@mui/material/Box';

import { useRef } from 'react';
import { m, useReducedMotion, useScroll, useTransform } from 'framer-motion';

import Box from '@mui/material/Box';

// ----------------------------------------------------------------------

type ScrollParallaxProps = BoxProps & {
  children: ReactNode;
  /** Vertical travel in px while section scrolls through viewport */
  offset?: number;
  /** Scale range while scrolling [enter, exit] */
  scaleRange?: [number, number, number];
};

/** Background / hero parallax — PUBG Mobile style depth on scroll */
export function ScrollParallax({
  children,
  offset = 100,
  scaleRange = [1.08, 1, 1.06],
  sx,
  ...other
}: ScrollParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [-offset * 0.35, offset * 0.65]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], scaleRange);

  if (reduceMotion) {
    return (
      <Box ref={ref} sx={[{ overflow: 'hidden' }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]} {...other}>
        {children}
      </Box>
    );
  }

  return (
    <Box
      ref={ref}
      sx={[{ overflow: 'hidden', position: 'relative' }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
      {...other}
    >
      <Box component={m.div} style={{ y, scale }} sx={{ width: 1, height: 1, willChange: 'transform' }}>
        {children}
      </Box>
    </Box>
  );
}
