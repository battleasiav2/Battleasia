import type { Transition, Variants } from 'framer-motion';

import { transitionEnter } from './transition';

// Soft ease-out — less overshoot than the old expo curve (smoother on mobile)
export const CINEMATIC_EASE = [0.22, 1, 0.36, 1] as const;

export const cinematicTransition: Transition = {
  duration: 0.72,
  ease: CINEMATIC_EASE,
};

export const cinematicSoftTransition: Transition = {
  duration: 0.58,
  ease: CINEMATIC_EASE,
};

/** Full section rises into place — lighter travel/scale for buttery scroll */
export function varCinematicReveal(distance = 48): Variants {
  return {
    initial: {
      opacity: 0,
      y: distance,
      scale: 0.985,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: transitionEnter(cinematicTransition),
    },
  };
}

/** Stagger container for titles + cards inside a section */
export function varCinematicContainer(): Variants {
  return {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.04,
      },
    },
  };
}

/** Child item — smaller travel, same easing */
export function varCinematicItem(distance = 28): Variants {
  return {
    initial: {
      opacity: 0,
      y: distance,
      scale: 0.99,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: transitionEnter(cinematicSoftTransition),
    },
  };
}

/** Horizontal slide — alternate sections left/right like game promos */
export function varCinematicSlide(direction: 'left' | 'right' = 'left', distance = 40): Variants {
  const x = direction === 'left' ? -distance : distance;
  return {
    initial: { opacity: 0, x, scale: 0.99 },
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: transitionEnter(cinematicTransition),
    },
  };
}
