/**
 * Core Web Vitals budgets — treat as ship gates, not aspirations.
 * See ARCHITECTURE-PERFORMANCE.md
 */
export const PERF_BUDGETS = {
  lighthousePerformance: { min: 90, target: 95 },
  lcpMs: { max: 2500 },
  cls: { max: 0.1 },
  tbtMs: { max: 150 },
  /** Max sync JS on critical path before deferring heavy UI */
  criticalJsKb: { max: 200 },
} as const;

/** Libraries that must never be statically imported from LCP/hero/header trees */
export const LCP_FORBIDDEN_STATIC_IMPORTS = [
  'framer-motion',
  'three',
  '@react-three/fiber',
  '@react-three/drei',
  'socket.io-client',
  'embla-carousel',
  'embla-carousel-react',
] as const;
