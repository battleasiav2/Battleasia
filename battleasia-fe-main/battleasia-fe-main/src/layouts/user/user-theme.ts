import type { SxProps, Theme } from '@mui/material/styles';

import { alpha } from '@mui/material/styles';

import {
  GLASS_CARD_RADIUS,
  GLASS_CARD_RADIUS_SM,
  getDefaultGlassTokens,
  getGlassShellSx,
  getGlassInnerSx,
  getGlassBadgeChipSx,
} from 'src/components/battle-glass-card';
import { getGoldDividerSx } from 'src/components/battle-gold-divider';

// ----------------------------------------------------------------------

/** Homepage-aligned brand tokens for authenticated area */
export const USER_COLORS = {
  gold: '#f5c518',
  goldDark: '#d97706',
  goldLight: '#fbbf24',
  goldGradient: 'linear-gradient(180deg, #f59e0b 0%, #ea8c00 52%, #d97706 100%)',
  goldGradientHover: 'linear-gradient(180deg, #fbbf24 0%, #f59e0b 52%, #ea8c00 100%)',
  success: '#22c55e',
  error: '#ef4444',
  info: '#38bdf8',
  surface: '#0a0a0a',
  pageBg: '#000000',
  textPrimary: '#ffffff',
  textBody: '#f5f5f5',
  textMuted: alpha('#94a3b8', 0.95),
  textSubtle: alpha('#cbd5e1', 0.78),
  border: alpha('#ffffff', 0.12),
  borderStrong: alpha('#ffffff', 0.18),
} as const;

export const USER_IMAGES = {
  pageBg: '/assets/images/dashboard-pubg-black.webp',
  heroBanner: '/assets/images/hero-banner-pubg.webp',
  btnBg: '/assets/images/btn-bg.webp',
  navBg: '/assets/images/nav-bg.webp',
  blackBg: '/assets/images/black_bg.webp',
} as const;

/** @deprecated Use USER_COLORS.gold */
export const USER_GOLD = USER_COLORS.gold;

/** @deprecated Use USER_IMAGES.pageBg */
export const USER_PAGE_BG_IMAGE = USER_IMAGES.pageBg;

// ----------------------------------------------------------------------

export function getUserGlassTokens() {
  return getDefaultGlassTokens();
}

export const userGlassCardSx: SxProps<Theme> = getGlassShellSx(getDefaultGlassTokens());

export const userGlassInnerSx: SxProps<Theme> = getGlassInnerSx(getDefaultGlassTokens());

export const userGlassBadgeSx: SxProps<Theme> = getGlassBadgeChipSx(getDefaultGlassTokens());

export const userGlassDialogPaperSx: SxProps<Theme> = getGlassShellSx(getDefaultGlassTokens(), {
  bgcolor: alpha('#000000', 0.88),
  backgroundColor: alpha('#000000', 0.88),
  p: 0,
});

export const userPageTitleSx: SxProps<Theme> = {
  fontSize: { xs: 26, sm: 32, md: 40 },
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: { xs: 0.5, md: 1 },
  color: USER_COLORS.textPrimary,
  lineHeight: 1.08,
  textShadow: `0 0 40px ${alpha(USER_COLORS.gold, 0.12)}`,
};

export const userPageDividerSx: SxProps<Theme> = getGoldDividerSx({ variant: 'title' });

export const userMutedTextSx: SxProps<Theme> = {
  color: USER_COLORS.textMuted,
  lineHeight: 1.6,
};

export const userGoldButtonSx: SxProps<Theme> = {
  background: USER_COLORS.goldGradient,
  color: '#111111',
  fontWeight: 800,
  letterSpacing: 0.6,
  textTransform: 'uppercase',
  borderRadius: 0,
  boxShadow: `0 4px 16px ${alpha('#f59e0b', 0.3)}`,
  '&:hover': {
    background: USER_COLORS.goldGradientHover,
    backgroundColor: 'transparent',
    boxShadow: `0 8px 24px ${alpha('#f59e0b', 0.35)}`,
  },
  '&.Mui-disabled': {
    background: alpha('#ffffff', 0.08),
    color: alpha('#ffffff', 0.35),
  },
};

export const userMeshButtonSx: SxProps<Theme> = {
  color: '#111111',
  fontWeight: 800,
  letterSpacing: 0.5,
  borderRadius: 0,
  background: `url(${USER_IMAGES.btnBg}) no-repeat center center`,
  backgroundSize: 'cover',
  boxShadow: `0 4px 18px ${alpha(USER_COLORS.gold, 0.28)}`,
  '&:hover': {
    filter: 'brightness(1.08)',
    backgroundColor: 'transparent',
  },
};

export const userGhostButtonSx: SxProps<Theme> = {
  color: USER_COLORS.textSubtle,
  border: `1px solid ${USER_COLORS.border}`,
  borderRadius: `${GLASS_CARD_RADIUS_SM}px`,
  bgcolor: alpha('#000000', 0.42),
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  fontWeight: 600,
  letterSpacing: 0.4,
  '&:hover': {
    bgcolor: alpha(USER_COLORS.gold, 0.1),
    borderColor: alpha(USER_COLORS.gold, 0.38),
    color: USER_COLORS.gold,
  },
};

export const userHeaderPillSx: SxProps<Theme> = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.75,
  px: 1.5,
  py: 0.75,
  borderRadius: `${GLASS_CARD_RADIUS}px`,
  bgcolor: alpha('#000000', 0.42),
  border: `1px solid ${USER_COLORS.border}`,
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
};

/** Scoped typography + form colors for dark user pages (light theme defaults are black text). */
export function getUserLayoutMainSx(): SxProps<Theme> {
  return {
    color: USER_COLORS.textBody,
    [`& .MuiTypography-root`]: {
      color: USER_COLORS.textBody,
    },
    [`& .MuiTypography-h1, & .MuiTypography-h2, & .MuiTypography-h3, & .MuiTypography-h4, & .MuiTypography-h5, & .MuiTypography-h6`]:
      {
        color: USER_COLORS.textPrimary,
      },
    [`& .MuiTableCell-root`]: {
      color: USER_COLORS.textBody,
      borderColor: USER_COLORS.border,
    },
    [`& .MuiTableCell-head`]: {
      color: USER_COLORS.gold,
      fontWeight: 700,
    },
    [`& .MuiInputBase-input`]: {
      color: USER_COLORS.textPrimary,
    },
    [`& .MuiInputLabel-root`]: {
      color: USER_COLORS.textMuted,
    },
    [`& .MuiFormHelperText-root`]: {
      color: USER_COLORS.textMuted,
    },
    [`& .MuiOutlinedInput-notchedOutline`]: {
      borderColor: USER_COLORS.border,
    },
    [`& .MuiTab-root`]: {
      color: USER_COLORS.textMuted,
    },
    [`& .MuiTab-root.Mui-selected`]: {
      color: USER_COLORS.gold,
    },
    [`& .MuiBreadcrumbs-root .MuiTypography-root`]: {
      color: USER_COLORS.textMuted,
    },
    [`& .MuiListItemText-primary`]: {
      color: USER_COLORS.textPrimary,
    },
    [`& .MuiListItemText-secondary`]: {
      color: USER_COLORS.textMuted,
    },
    [`& .MuiDivider-root`]: {
      borderColor: USER_COLORS.border,
    },
  };
}

/** Page shell background — matches homepage section pattern */
export function getUserPageShellOverlays(): { before: SxProps<Theme>; after: SxProps<Theme> } {
  return {
    before: {
      content: '""',
      position: 'absolute',
      inset: 0,
      backgroundImage: `url(${USER_IMAGES.pageBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center top',
      backgroundRepeat: 'no-repeat',
      opacity: 0.32,
      pointerEvents: 'none',
    },
    after: {
      content: '""',
      position: 'absolute',
      inset: 0,
      background: `
        radial-gradient(ellipse 90% 55% at 50% -5%, ${alpha('#f5a623', 0.09)} 0%, transparent 58%),
        radial-gradient(ellipse 50% 35% at 15% 95%, ${alpha(USER_COLORS.info, 0.06)} 0%, transparent 50%),
        linear-gradient(180deg, ${alpha('#000000', 0.35)} 0%, ${alpha('#000000', 0.88)} 55%, #000000 100%)
      `,
      pointerEvents: 'none',
    },
  };
}

/** @deprecated Use userPageTitleSx */
export const userSectionTitleSx = userPageTitleSx;

/** @deprecated Use userPageDividerSx */
export const userSectionDividerSx = userPageDividerSx;
