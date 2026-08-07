import { lazy, Suspense, type ComponentType, type ReactNode } from 'react';

/**
 * Framer Motion must never be a static import on LCP trees.
 * Use this wrapper for below-fold / idle decorative motion only.
 *
 * Example:
 *   <LazyMotion>
 *     {(m) => <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} />}
 *   </LazyMotion>
 */
const MotionRuntime = lazy(() =>
  import('framer-motion').then((mod) => ({
    default: function MotionBridge({
      children,
    }: {
      children: (m: typeof mod.m, reduced: boolean) => ReactNode;
    }) {
      // Prefer reduced motion when user requests it
      const reduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      return <>{children(mod.m, reduced)}</>;
    },
  }))
);

type LazyMotionProps = {
  children: (
    m: ComponentType<Record<string, unknown>> & Record<string, unknown>,
    reducedMotion: boolean
  ) => ReactNode;
  fallback?: ReactNode;
};

export function LazyMotion({ children, fallback = null }: LazyMotionProps) {
  return (
    <Suspense fallback={fallback}>
      <MotionRuntime>{children as never}</MotionRuntime>
    </Suspense>
  );
}
