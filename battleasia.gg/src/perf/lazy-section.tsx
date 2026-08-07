import { Suspense, lazy, type ComponentType, type ReactNode } from 'react';

import Box from '@mui/material/Box';

import { useRef } from 'react';

import { useInView } from './use-in-view';

type LazySectionProps = {
  /** Min height reserves space → prevents CLS while chunk loads */
  minHeight?: number | { xs?: number; md?: number };
  fallback?: ReactNode;
  children: ReactNode;
  rootMargin?: string;
};

/**
 * Renders children only when near viewport. Pair with React.lazy for code-split sections.
 */
export function LazySection({
  minHeight = 320,
  fallback,
  children,
  rootMargin = '300px 0px',
}: LazySectionProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const visible = useInView(ref, { once: true, rootMargin });

  return (
    <Box
      ref={ref}
      sx={{
        minHeight,
        width: 1,
        contentVisibility: 'auto',
        containIntrinsicSize:
          typeof minHeight === 'number'
            ? `auto ${minHeight}px`
            : {
                xs: minHeight.xs ? `auto ${minHeight.xs}px` : undefined,
                md: minHeight.md ? `auto ${minHeight.md}px` : undefined,
              },
      }}
    >
      {visible ? children : fallback ?? null}
    </Box>
  );
}

/** Code-split a section module and gate it behind LazySection */
export function createLazySection<T extends ComponentType<any>>(
  loader: () => Promise<{ default: T }>,
  options?: { minHeight?: LazySectionProps['minHeight'] }
) {
  const Comp = lazy(loader);

  return function LazyLoadedSection(props: React.ComponentProps<T>) {
    return (
      <LazySection minHeight={options?.minHeight ?? 360}>
        <Suspense fallback={<Box sx={{ minHeight: options?.minHeight ?? 360 }} />}>
          <Comp {...props} />
        </Suspense>
      </LazySection>
    );
  };
}
