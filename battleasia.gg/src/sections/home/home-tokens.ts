import type { SxProps, Theme } from '@mui/material/styles';
import { alpha, keyframes } from '@mui/material/styles';

import { HOME_GOLD } from './home-blur-panel';

/** Readable muted copy on dark surfaces — brighter than legacy gray-500 tints */
export const HOME_MUTED_TEXT = '#D1D5DB';
export const HOME_MUTED_TEXT_DIM = alpha('#D1D5DB', 0.82);

export const livePulseDotKeyframes = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 0 0 0 ${alpha('#22c55e', 0.55)};
  }
  50% {
    opacity: 0.72;
    transform: scale(0.9);
    box-shadow: 0 0 0 6px ${alpha('#22c55e', 0)};
  }
`;

export const homeGoldCtaSx: SxProps<Theme> = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 0.75,
  minHeight: 44,
  px: { xs: 2, sm: 2.5 },
  fontSize: { xs: 11, sm: 13 },
  fontWeight: 800,
  letterSpacing: 0.8,
  textTransform: 'uppercase',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  borderRadius: 0,
  color: '#111111',
  backgroundImage: `linear-gradient(180deg, #f5c518 0%, #eab308 52%, #d4a017 100%)`,
  backgroundColor: '#f5c518',
  border: `1px solid ${alpha('#ca8a04', 0.85)}`,
  boxShadow: `0 4px 18px ${alpha('#f5c518', 0.28)}, inset 0 1px 0 ${alpha('#ffffff', 0.22)}`,
  transition: 'transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease',
  '&:hover': {
    color: '#111111',
    filter: 'brightness(1.05)',
    boxShadow: `0 6px 24px ${alpha('#f5c518', 0.38)}, inset 0 1px 0 ${alpha('#ffffff', 0.28)}`,
    transform: 'translateY(-1px)',
  },
};

export const homePremiumPanelGlowSx: SxProps<Theme> = {
  border: `1px solid ${alpha(HOME_GOLD, 0.26)}`,
  boxShadow: `
    inset 0 1px 0 ${alpha('#ffffff', 0.05)},
    0 8px 32px ${alpha('#000000', 0.42)},
    0 0 28px ${alpha(HOME_GOLD, 0.1)}
  `,
};

export const homePremiumCardGlowSx: SxProps<Theme> = {
  border: `1px solid ${alpha(HOME_GOLD, 0.22)}`,
  boxShadow: `
    0 10px 28px ${alpha('#000000', 0.5)},
    0 0 22px ${alpha(HOME_GOLD, 0.1)}
  `,
};
