import type { SxProps, Theme } from '@mui/material/styles';

export const glassShimmerKeyframes = {
  '@keyframes glassShimmer': {
    '0%': { transform: 'translateX(-130%) skewX(-14deg)', opacity: 0 },
    '20%': { opacity: 1 },
    '55%': { opacity: 1 },
    '100%': { transform: 'translateX(240%) skewX(-14deg)', opacity: 0 },
  },
  '@keyframes glassSparkle': {
    '0%, 100%': { opacity: 0.35 },
    '50%': { opacity: 0.85 },
  },
};

export const glassShimmerLayer: SxProps<Theme> = {
  ...glassShimmerKeyframes,
  '&:after': {
    content: "''",
    position: 'absolute',
    top: '-10%',
    left: 0,
    width: '38%',
    height: '120%',
    background:
      'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.14) 50%, rgba(255,255,255,0.03) 75%, transparent 100%)',
    animation: 'glassShimmer 5.5s ease-in-out infinite',
    pointerEvents: 'none',
    zIndex: 0,
  },
};

export const glassSparkleLayer: SxProps<Theme> = {
  '&:before': {
    content: "''",
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      radial-gradient(circle at 18% 22%, rgba(255,255,255,0.12) 0, transparent 2px),
      radial-gradient(circle at 72% 38%, rgba(245,197,24,0.16) 0, transparent 2px),
      radial-gradient(circle at 44% 68%, rgba(255,255,255,0.1) 0, transparent 1.5px),
      radial-gradient(circle at 86% 74%, rgba(34,211,238,0.12) 0, transparent 2px)
    `,
    animation: 'glassSparkle 3.2s ease-in-out infinite',
    pointerEvents: 'none',
    zIndex: 0,
  },
};
