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

  // Auth-style diamond divider: two gradient segments with a gap + a glowing center gem.
  const gemBackground = `linear-gradient(90deg,
    transparent 0%,
    ${alpha(gold, 0.12)} 14%,
    ${alpha(gold, 0.6)} 44%,
    transparent 47%,
    transparent 53%,
    ${alpha(gold, 0.6)} 56%,
    ${alpha(gold, 0.12)} 86%,
    transparent 100%)`;

  const solidBackground = `linear-gradient(90deg,
    transparent 0%,
    ${alpha(gold, 0.28)} 25%,
    ${alpha(gold, 0.75)} 50%,
    ${alpha(gold, 0.28)} 75%,
    transparent 100%)`;

  return {
    position: 'relative',
    display: 'block',
    mt,
    mx: 'auto',
    width,
    height: 1.5,
    borderRadius: 999,
    overflow: 'visible',
    flexShrink: 0,
    background: showCenterGem ? gemBackground : solidBackground,
    boxShadow: showCenterGem ? 'none' : `0 0 8px ${alpha(gold, 0.18)}`,
    ...(showCenterGem
      ? {
          '&::after': {
            content: '""',
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%) rotate(45deg)',
            width: 7,
            height: 7,
            borderRadius: '1px',
            bgcolor: gold,
            boxShadow: `0 0 8px ${alpha(gold, 0.65)}`,
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
