import type { SxProps, Theme } from '@mui/material/styles';
import type { CSSProperties } from 'react';

import { alpha } from '@mui/material/styles';

// ----------------------------------------------------------------------

export const BRAND_GOLD = '#f5c518';

export type GoldDividerVariant = 'title' | 'hero' | 'section' | 'compact' | 'full';

type DividerWidth = CSSProperties['width'] | Record<string, CSSProperties['width']>;

type GoldDividerOptions = {
  variant?: GoldDividerVariant;
  width?: DividerWidth;
  mt?: number;
  showCenterGem?: boolean;
};

const VARIANT_PRESETS: Record<
  GoldDividerVariant,
  { width: DividerWidth; mt: number; showCenterGem: boolean }
> = {
  title: { width: { xs: 140, sm: 200, md: 240 }, mt: 1, showCenterGem: true },
  hero: { width: { xs: 140, sm: 200 }, mt: 2, showCenterGem: true },
  section: { width: { xs: 120, sm: 180 }, mt: 1.5, showCenterGem: true },
  compact: { width: 120, mt: 0.5, showCenterGem: true },
  full: { width: '100%', mt: 1, showCenterGem: false },
};

/** Premium gold accent line — glow bloom + optional center gem (replaces flat gradient bar). */
export function getGoldDividerSx(options?: GoldDividerOptions): SxProps<Theme> {
  const variant = options?.variant ?? 'title';
  const preset = VARIANT_PRESETS[variant];
  const width = options?.width ?? preset.width;
  const mt = options?.mt ?? preset.mt;
  const showCenterGem = options?.showCenterGem ?? preset.showCenterGem;
  const gold = BRAND_GOLD;

  return {
    position: 'relative',
    mt,
    width,
    height: 4,
    borderRadius: 999,
    overflow: 'visible',
    flexShrink: 0,
    background: `linear-gradient(90deg,
      transparent 0%,
      ${alpha(gold, 0.06)} 10%,
      ${alpha(gold, 0.42)} 34%,
      ${alpha('#fffbeb', 0.98)} 50%,
      ${alpha(gold, 0.42)} 66%,
      ${alpha(gold, 0.06)} 90%,
      transparent 100%)`,
    boxShadow: `
      0 0 16px ${alpha(gold, 0.38)},
      0 0 4px ${alpha(gold, 0.55)},
      inset 0 1px 0 ${alpha('#ffffff', 0.42)},
      inset 0 -1px 0 ${alpha('#000000', 0.45)
    }`,
    '&::before': {
      content: '""',
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      width: showCenterGem ? '72%' : '88%',
      height: 10,
      borderRadius: 999,
      background: `radial-gradient(ellipse at center, ${alpha(gold, 0.32)} 0%, transparent 72%)`,
      filter: 'blur(5px)',
      pointerEvents: 'none',
    },
    ...(showCenterGem
      ? {
          '&::after': {
            content: '""',
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%) rotate(45deg)',
            width: 5,
            height: 5,
            borderRadius: '1px',
            bgcolor: gold,
            boxShadow: `
              0 0 10px ${alpha(gold, 0.85)},
              0 0 2px ${alpha('#ffffff', 0.9)}
            `,
            pointerEvents: 'none',
          },
        }
      : {}),
  };
}

export const goldDividerTitleSx = getGoldDividerSx({ variant: 'title' });
export const goldDividerHeroSx = getGoldDividerSx({ variant: 'hero' });
export const goldDividerSectionSx = getGoldDividerSx({ variant: 'section' });
export const goldDividerCompactSx = getGoldDividerSx({ variant: 'compact' });
