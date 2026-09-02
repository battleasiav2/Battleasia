import type { SxProps, Theme } from '@mui/material/styles';

import { alpha } from '@mui/material/styles';
import { goldAlpha } from 'src/theme/accent-presets';

// ----------------------------------------------------------------------

export const HOME_SCROLL_GOLD = 'var(--ba-gold)';

/** Mobile sideways scroll track — matches Play Your Game row */
export const homeMobileScrollTrackSx: SxProps<Theme> = {
  overflowX: { xs: 'auto', md: 'visible' },
  // auto on x alone would promote y to auto — keep section scroll on the document only
  overflowY: { xs: 'hidden', md: 'visible' },
  scrollSnapType: { xs: 'x mandatory', md: 'none' },
  WebkitOverflowScrolling: 'touch',
  pb: { xs: 1.5, md: 0 },
  '&::-webkit-scrollbar': { height: 4 },
  '&::-webkit-scrollbar-thumb': {
    bgcolor: goldAlpha(0.35),
    borderRadius: 0,
  },
};

export const homeMobileScrollItemSx: SxProps<Theme> = {
  scrollSnapAlign: 'start',
};

/** One full card per swipe — use inside panel scroll rows */
export const homeMobileScrollFlexRowSx: SxProps<Theme> = {
  display: 'flex',
  gap: 1.25,
  overflowX: 'auto',
  overflowY: 'hidden',
  scrollSnapType: 'x mandatory',
  WebkitOverflowScrolling: 'touch',
  pb: 1.5,
  px: { xs: 0.5, md: 0 },
  '&::-webkit-scrollbar': { height: 4 },
  '&::-webkit-scrollbar-thumb': {
    bgcolor: goldAlpha(0.35),
    borderRadius: 0,
  },
};

export const homeMobileScrollFlexItemFullSx: SxProps<Theme> = {
  ...homeMobileScrollItemSx,
  flex: '0 0 100%',
  minWidth: 0,
  maxWidth: '100%',
};

export function homeMobileScrollGridSx(
  columns: { xs: string; md?: string; lg?: string },
  gap: { xs: number; md?: number } = { xs: 1.25, md: 2 }
): SxProps<Theme> {
  return {
    display: 'grid',
    gridTemplateColumns: {
      xs: columns.xs,
      ...(columns.md ? { md: columns.md } : {}),
      ...(columns.lg ? { lg: columns.lg } : {}),
    },
    alignItems: 'stretch',
    gap,
    ...homeMobileScrollTrackSx,
    px: { xs: 0.5, md: 0 },
    pt: { xs: 0.5, md: 0 },
  };
}
