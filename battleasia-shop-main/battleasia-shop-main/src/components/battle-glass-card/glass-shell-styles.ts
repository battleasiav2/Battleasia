import type { SxProps, Theme } from '@mui/material/styles';

import { GLASS_CARD_RADIUS, GLASS_CARD_RADIUS_SM } from './glass-card-tokens';
import { glassShimmerKeyframes, glassShimmerLayer } from './glass-shimmer';
import type { GlassCardTokens } from './types';
import { DEFAULT_GLASS_CARD_VARIANT, GLASS_CARD_VARIANTS } from './variants';

/** Prevent MUI Card/Paper default white `background.paper` from bleeding through glass. */
export const glassSurfaceResetSx: SxProps<Theme> = {
  backgroundImage: 'none',
  color: 'inherit',
};

export function getDefaultGlassTokens(): GlassCardTokens {
  return GLASS_CARD_VARIANTS[DEFAULT_GLASS_CARD_VARIANT];
}

/** Flatten nested sx arrays from getGlassShellSx / getGlassInnerSx for MUI Card/Box. */
export function mergeGlassSx(...parts: Array<SxProps<Theme> | undefined>): SxProps<Theme> {
  return parts.flatMap((part) => {
    if (!part) return [];
    return Array.isArray(part) ? part : [part];
  }) as SxProps<Theme>;
}

export function getGlassShellSx(tokens: GlassCardTokens, extra?: SxProps<Theme>): SxProps<Theme> {
  const { shell } = tokens;

  const base: SxProps<Theme> = {
    backgroundImage: 'none',
    color: 'inherit',
    borderRadius: `${GLASS_CARD_RADIUS}px`,
    position: 'relative',
    overflow: 'hidden',
    bgcolor: shell.bgcolor,
    backgroundColor: shell.bgcolor,
    border: shell.border,
    boxShadow: shell.boxShadow,
    backdropFilter: shell.backdropFilter,
    WebkitBackdropFilter: shell.backdropFilter,
    ...(shell.shimmer ? { ...glassShimmerKeyframes, ...glassShimmerLayer } : {}),
    ...(shell.overlay
      ? {
          '&:before': {
            content: "''",
            position: 'absolute',
            inset: 0,
            background: shell.overlay,
            pointerEvents: 'none',
            zIndex: 0,
            ...(shell.shimmer ? { animation: 'glassSparkle 3.2s ease-in-out infinite' } : {}),
          },
        }
      : {}),
    '& > *': { position: 'relative', zIndex: 1 },
  };

  if (!extra) return base;
  return [base, extra] as SxProps<Theme>;
}

export function getGlassInnerSx(tokens: GlassCardTokens, extra?: SxProps<Theme>): SxProps<Theme> {
  const { stat } = tokens;

  const base: SxProps<Theme> = {
    backgroundImage: 'none',
    color: 'inherit',
    borderRadius: `${GLASS_CARD_RADIUS}px`,
    position: 'relative',
    overflow: 'hidden',
    bgcolor: stat.bgcolor,
    backgroundColor: stat.bgcolor,
    border: stat.border,
    boxShadow: stat.boxShadow,
    backdropFilter: 'blur(18px) saturate(1.1)',
    WebkitBackdropFilter: 'blur(18px) saturate(1.1)',
    ...(stat.shimmer ? { ...glassShimmerKeyframes, ...glassShimmerLayer } : {}),
    ...(stat.overlay
      ? {
          '&:before': {
            content: "''",
            position: 'absolute',
            inset: 0,
            background: stat.overlay,
            pointerEvents: 'none',
            zIndex: 0,
          },
        }
      : {}),
    '& > *': { position: 'relative', zIndex: 1 },
    transition: 'background-color 0.2s ease, border-color 0.2s ease',
  };

  if (!extra) return base;
  return [base, extra] as SxProps<Theme>;
}

export function getGlassBadgeChipSx(tokens: GlassCardTokens): SxProps<Theme> {
  return {
    borderRadius: `${GLASS_CARD_RADIUS_SM}px`,
    fontWeight: 700,
    fontSize: { xs: '0.65rem', sm: '0.75rem' },
    letterSpacing: 0.5,
    height: 26,
    bgcolor: tokens.badge.bgcolor,
    color: tokens.badge.color,
    border: tokens.badge.border,
    boxShadow: tokens.badge.boxShadow,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    '& .MuiChip-label': { px: 1 },
  };
}

export function getGlassIconButtonSx(): SxProps<Theme> {
  return {
    width: { xs: 28, sm: 36 },
    height: { xs: 28, sm: 36 },
    borderRadius: `${GLASS_CARD_RADIUS_SM}px`,
    bgcolor: 'rgba(0, 0, 0, 0.36)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: '#f8fafc',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    '&:hover': {
      bgcolor: 'rgba(0, 0, 0, 0.5)',
      borderColor: 'rgba(255, 255, 255, 0.22)',
    },
  };
}
