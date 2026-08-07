import { LazyMotion } from 'framer-motion';

// ----------------------------------------------------------------------

export type MotionLazyProps = {
  children: React.ReactNode;
};

/** Async `domAnimation` — never sync-load `domMax` on the critical path (TBT). */
const loadFeatures = () =>
  import('framer-motion').then((mod) => mod.domAnimation);

export function MotionLazy({ children }: MotionLazyProps) {
  return (
    <LazyMotion features={loadFeatures}>
      {children}
    </LazyMotion>
  );
}
