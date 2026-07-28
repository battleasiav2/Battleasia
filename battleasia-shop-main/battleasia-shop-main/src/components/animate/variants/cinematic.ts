import type { Transition, Variants } from 'framer-motion';

import { transitionEnter } from './transition';

// PUBG Mobile–style cinematic scroll easing
export const CINEMATIC_EASE = [0.16, 1, 0.3, 1] as const;

export const cinematicTransition: Transition = {
  duration: 1.05,
  ease: CINEMATIC_EASE,
};

export const cinematicSoftTransition: Transition = {
  duration: 0.85,
  ease: CINEMATIC_EASE,
};

/** Full section rises into place — like pubgmobile.com home panels */
export function varCinematicReveal(distance = 88): Variants {
  return {
    initial: {
      opacity: 0,
      y: distance,
      scale: 0.94,
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
        staggerChildren: 0.14,
        delayChildren: 0.08,
      },
    },
  };
}

/** Child item — smaller travel, same easing */
export function varCinematicItem(distance = 56): Variants {
  return {
    initial: {
      opacity: 0,
      y: distance,
      scale: 0.97,
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
export function varCinematicSlide(direction: 'left' | 'right' = 'left', distance = 72): Variants {
  const x = direction === 'left' ? -distance : distance;
  return {
    initial: { opacity: 0, x, scale: 0.96 },
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: transitionEnter(cinematicTransition),
    },
  };
}
