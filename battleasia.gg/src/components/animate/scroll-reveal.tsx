import type { MotionProps } from 'framer-motion';
import type { BoxProps } from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';

import { m, useReducedMotion } from 'framer-motion';
import { forwardRef } from 'react';

import Box from '@mui/material/Box';

import { varFade, varContainer } from './variants';
import {
  varCinematicContainer,
  varCinematicItem,
  varCinematicReveal,
  varCinematicSlide,
} from './variants/cinematic';

// ----------------------------------------------------------------------

export type ScrollRevealPreset = 'soft' | 'cinematic' | 'cinematic-slide-left' | 'cinematic-slide-right';

export type ScrollRevealProps = BoxProps &
  MotionProps & {
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

function resolveVariants(
  preset: ScrollRevealPreset,
  stagger: boolean,
  direction: ScrollRevealProps['direction'],
  distance: number
) {
  if (stagger) return varCinematicContainer();
  if (preset === 'cinematic-slide-left') return varCinematicSlide('left', distance);
  if (preset === 'cinematic-slide-right') return varCinematicSlide('right', distance);
  if (preset === 'cinematic') return varCinematicReveal(distance);
  return varFade(direction ?? 'inUp', { distance });
}

/**
 * Premium scroll-into-view reveal.
 * `preset="cinematic"` matches PUBG Mobile home section entrances.
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
    viewport,
    variants,
    sx,
    ...other
  } = props;

  const reduceMotion = useReducedMotion();

  const sectionSx: SxProps<Theme> = [
    fullViewport && {
      minHeight: { xs: 'auto', md: '100vh' },
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      scrollSnapAlign: 'start',
      scrollSnapStop: 'normal',
    },
    ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
  ];

  if (disabled || reduceMotion) {
    return (
      <Box ref={ref} sx={sectionSx} {...other}>
        {children}
      </Box>
    );
  }

  const resolvedVariants = variants ?? resolveVariants(preset, stagger, direction, distance);

  return (
    <Box
      ref={ref}
      component={m.div}
      initial="initial"
      whileInView="animate"
      viewport={{
        once: true,
        amount,
        margin: preset.startsWith('cinematic') ? '0px 0px -6% 0px' : '0px 0px -8% 0px',
        ...viewport,
      }}
      variants={resolvedVariants}
      sx={sectionSx}
      {...other}
    >
      {children}
    </Box>
  );
});

ScrollReveal.displayName = 'ScrollReveal';

/** Stagger child for use inside `<ScrollReveal preset="cinematic" stagger>` */
export const ScrollRevealItem = forwardRef<HTMLDivElement, BoxProps & MotionProps>((props, ref) => {
  const { children, sx, ...other } = props;
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <Box ref={ref} sx={sx} {...other}>
        {children}
      </Box>
    );
  }

  return (
    <Box
      ref={ref}
      component={m.div}
      variants={varCinematicItem()}
      sx={sx}
      {...other}
    >
      {children}
    </Box>
  );
});

ScrollRevealItem.displayName = 'ScrollRevealItem';
