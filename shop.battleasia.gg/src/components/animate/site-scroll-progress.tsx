import { ScrollProgress } from './scroll-progress/scroll-progress';
import { useScrollProgress } from './scroll-progress/use-scroll-progress';

// ----------------------------------------------------------------------

const GOLD = '#f5c518';

/**
 * Thin gold reading progress bar fixed to the top of the viewport.
 * Site-wide scrollytelling chrome — non-intrusive, brand-aligned.
 */
export function SiteScrollProgress() {
  const { scrollYProgress } = useScrollProgress('document');

  return (
    <ScrollProgress
      variant="linear"
      progress={scrollYProgress}
      portal
      color="inherit"
      size={2.5}
      sx={{
        position: 'fixed',
        zIndex: (theme) => theme.zIndex.appBar + 2,
        top: 0,
        left: 0,
        right: 0,
        height: 2.5,
        transformOrigin: '0%',
        pointerEvents: 'none',
        background: `linear-gradient(90deg, ${GOLD}, #ffe08a, ${GOLD})`,
        boxShadow: `0 0 12px ${GOLD}88`,
      }}
    />
  );
}
