import type { SxProps, Theme } from '@mui/material/styles';

import { alpha, keyframes } from '@mui/material/styles';

import {
  GLASS_CARD_RADIUS,
  GLASS_CARD_RADIUS_SM,
  getDefaultGlassTokens,
  getGlassShellSx,
  getGlassInnerSx,
  getGlassBadgeChipSx,
} from 'src/components/battle-glass-card';
import { getGoldDividerSx } from 'src/components/battle-gold-divider';
import { goldAlpha } from 'src/theme/accent-presets';

// ----------------------------------------------------------------------

/** Homepage-aligned brand tokens for authenticated area */
export const USER_COLORS = {
  gold: 'var(--ba-gold)',
  goldDark: 'var(--ba-gold-dark)',
  goldLight: 'var(--ba-gold-light)',
  goldGradient: 'linear-gradient(180deg, var(--ba-gold-light) 0%, var(--ba-gold) 52%, var(--ba-gold-dark) 100%)',
  goldGradientHover: 'linear-gradient(180deg, var(--ba-gold-light) 0%, var(--ba-gold) 48%, var(--ba-gold) 100%)',
  success: '#22c55e',
  error: '#ef4444',
  info: '#38bdf8',
  surface: '#0a0a0a',
  pageBg: '#000000',
  textPrimary: '#ffffff',
  textBody: '#f5f5f5',
  /** Secondary copy — keep high contrast on dark glass */
  textMuted: '#c5ced9',
  /** Supporting values / meta — brighter than muted */
  textSubtle: '#e8eef5',
  border: alpha('#ffffff', 0.12),
  borderStrong: alpha('#ffffff', 0.18),
} as const;

export type UserChipTone = 'gold' | 'success' | 'error' | 'info' | 'neutral';

export { goldAlpha } from 'src/theme/accent-presets';

/** Dark-glass chips that stay readable even when MUI dark scheme overrides filled defaults */
export function getUserChipSx(tone: UserChipTone = 'gold'): SxProps<Theme> {
  const tones: Record<UserChipTone, { fg: string; bg: string; border: string }> = {
    gold: {
      fg: USER_COLORS.gold,
      bg: goldAlpha( 0.16),
      border: goldAlpha( 0.45),
    },
    success: {
      fg: USER_COLORS.success,
      bg: alpha(USER_COLORS.success, 0.16),
      border: alpha(USER_COLORS.success, 0.4),
    },
    error: {
      fg: USER_COLORS.error,
      bg: alpha(USER_COLORS.error, 0.16),
      border: alpha(USER_COLORS.error, 0.4),
    },
    info: {
      fg: USER_COLORS.info,
      bg: alpha(USER_COLORS.info, 0.16),
      border: alpha(USER_COLORS.info, 0.4),
    },
    neutral: {
      fg: '#f1f5f9',
      bg: alpha('#ffffff', 0.1),
      border: alpha('#ffffff', 0.22),
    },
  };
  const c = tones[tone];
  return {
    borderRadius: `${GLASS_CARD_RADIUS_SM}px`,
    fontWeight: 700,
    bgcolor: c.bg,
    color: `${c.fg} !important`,
    border: `1px solid ${c.border}`,
    '& .MuiChip-label': {
      color: `${c.fg} !important`,
      fontWeight: 700,
    },
  };
}

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

/** Match-join / match-room chrome — gold edge wash + glass shell (use with gold rail). */
export const userPolishedDialogPaperSx: SxProps<Theme> = {
  ...userGlassDialogPaperSx,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  border: `1px solid ${goldAlpha( 0.26)}`,
  backgroundImage: `
    linear-gradient(180deg, ${goldAlpha( 0.07)} 0%, transparent 24%),
    linear-gradient(180deg, ${alpha('#0a0a0a', 0.97)} 0%, #050505 100%)
  `,
};

export const userPolishedDialogRailSx: SxProps<Theme> = {
  height: 3,
  flexShrink: 0,
  background: `linear-gradient(90deg, transparent, ${USER_COLORS.gold}, transparent)`,
};

export const userPolishedDialogTitleSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 1.5,
  px: { xs: 2.5, md: 3 },
  pt: { xs: 2.25, md: 2.75 },
  pb: 1.25,
};

export const userPolishedDialogEyebrowSx: SxProps<Theme> = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 1.1,
  textTransform: 'uppercase',
  color: goldAlpha( 0.9),
  mb: 0.5,
};

export const userPolishedDialogHeadingSx: SxProps<Theme> = {
  fontSize: { xs: 18, sm: 22 },
  fontWeight: 800,
  textTransform: 'uppercase',
  color: USER_COLORS.textPrimary,
  lineHeight: 1.15,
};

export const userPolishedDialogContentSx: SxProps<Theme> = {
  px: { xs: 2.5, md: 3 },
  py: 2,
  borderColor: alpha('#ffffff', 0.08),
};

export const userPolishedDialogCloseButtonSx: SxProps<Theme> = {
  color: USER_COLORS.textMuted,
  mt: -0.25,
  mr: -0.25,
  border: `1px solid ${alpha('#ffffff', 0.12)}`,
  borderRadius: `${GLASS_CARD_RADIUS}px`,
};

export const userPageTitleSx: SxProps<Theme> = {
  fontSize: { xs: 26, sm: 32, md: 40 },
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: { xs: 0.5, md: 1 },
  color: USER_COLORS.textPrimary,
  lineHeight: 1.08,
  textShadow: `0 0 40px ${goldAlpha( 0.12)}`,
};

export const userPageDividerSx: SxProps<Theme> = getGoldDividerSx({ variant: 'title' });

export const userMutedTextSx: SxProps<Theme> = {
  color: USER_COLORS.textMuted,
  lineHeight: 1.6,
};

/** Shared glass-gold chrome — secondary / tone buttons (success, error, ghost) */
const userGlassButtonBaseSx: SxProps<Theme> = {
  borderRadius: `${GLASS_CARD_RADIUS}px`,
  fontWeight: 800,
  letterSpacing: 0.6,
  textTransform: 'uppercase',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  backgroundImage: 'none',
  transition:
    'background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease, color 0.25s ease, transform 0.2s ease',
  '& .MuiButton-startIcon, & .MuiButton-endIcon, & .MuiLoadingButton-loadingIndicator': {
    color: 'inherit',
  },
  /** MUI dark mode paints contained/inherit buttons white — block that */
  '&.MuiButton-contained, &.MuiButton-outlined, &.MuiButton-text': {
    backgroundImage: 'none',
  },
  '&.MuiButton-containedInherit': {
    backgroundColor: `${alpha('#000000', 0.52)} !important`,
  },
};

function toneAlpha(color: string, opacity: number) {
  if (color.includes('--ba-gold-light')) return `rgba(var(--ba-gold-light-rgb), ${opacity})`;
  if (color.includes('--ba-gold')) return goldAlpha(opacity);
  return alpha(color, opacity);
}

function createUserGlassToneButtonSx(accent: string, accentLight: string): SxProps<Theme> {
  return {
    ...userGlassButtonBaseSx,
    color: accent,
    bgcolor: alpha('#000000', 0.52),
    backgroundColor: alpha('#000000', 0.52),
    border: `1px solid ${toneAlpha(accent, 0.58)}`,
    boxShadow: `
      inset 0 1px 0 ${alpha('#ffffff', 0.06)},
      0 0 0 1px ${toneAlpha(accent, 0.06)},
      0 8px 28px ${alpha('#000000', 0.45)}
    `,
    '&:hover': {
      bgcolor: toneAlpha(accent, 0.14),
      backgroundColor: `${toneAlpha(accent, 0.14)} !important`,
      borderColor: accent,
      color: accentLight,
      boxShadow: `
        inset 0 0 28px ${toneAlpha(accent, 0.16)},
        0 0 24px ${toneAlpha(accent, 0.22)},
        0 12px 36px ${alpha('#000000', 0.55)}
      `,
      transform: 'translateY(-1px)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
    '&.Mui-disabled': {
      bgcolor: alpha('#000000', 0.35),
      backgroundColor: `${alpha('#000000', 0.35)} !important`,
      color: toneAlpha(accent, 0.35),
      borderColor: toneAlpha(accent, 0.22),
      boxShadow: 'none',
    },
  };
}

/** Primary CTA — dark glass + gold border + gold text */
export const userGoldButtonSx: SxProps<Theme> = createUserGlassToneButtonSx(
  USER_COLORS.gold,
  USER_COLORS.goldLight
);

/** Solid filled gold CTA — flat auth Continue style (hero, header, primary actions) */
export const userSolidGoldButtonSx: SxProps<Theme> = {
  borderRadius: '4px',
  py: 0,
  minHeight: 44,
  height: 44,
  fontSize: 14,
  fontWeight: 700,
  letterSpacing: 0,
  textTransform: 'none',
  color: 'var(--ba-gold-ink)',
  backdropFilter: 'none',
  WebkitBackdropFilter: 'none',
  filter: 'none',
  textShadow: 'none',
  backgroundImage: 'none',
  background: 'var(--ba-gold)',
  border: `1px solid ${goldAlpha(0.85)}`,
  boxShadow: 'none',
  transition: 'background-color 0.15s ease, border-color 0.15s ease',
  '&.MuiButton-root:hover': { boxShadow: 'none' },
  '@media (hover: hover)': {
    '&:hover': {
      background: 'var(--ba-gold-light)',
      borderColor: goldAlpha(0.9),
      boxShadow: 'none',
      transform: 'none',
      filter: 'none',
    },
  },
  '&:active, &.Mui-focusVisible': {
    background: 'var(--ba-gold-dark)',
    borderColor: goldAlpha(0.9),
    boxShadow: 'none',
    transform: 'none',
    filter: 'none',
  },
  '&.Mui-disabled': {
    background: goldAlpha(0.28),
    color: alpha('#111111', 0.45),
    borderColor: goldAlpha(0.22),
    boxShadow: 'none',
    transform: 'none',
    filter: 'none',
  },
};

/** @deprecated Alias — same as userGoldButtonSx (Glass Gold Edge) */
export const userMeshButtonSx: SxProps<Theme> = userGoldButtonSx;

/** Win / success actions — green glass (same shape as gold) */
export const userSuccessButtonSx: SxProps<Theme> = createUserGlassToneButtonSx(
  USER_COLORS.success,
  '#4ade80'
);

/** Lose / destructive — red glass (logout, close ticket, etc.) */
export const userErrorButtonSx: SxProps<Theme> = createUserGlassToneButtonSx(
  USER_COLORS.error,
  '#f87171'
);

/** Logout — alias of error glass */
export const userLogoutButtonSx: SxProps<Theme> = userErrorButtonSx;

/** Secondary CTA — muted glass, gold edge on hover */
export const userGhostButtonSx: SxProps<Theme> = {
  ...userGlassButtonBaseSx,
  color: USER_COLORS.textSubtle,
  fontWeight: 700,
  letterSpacing: 0.5,
  border: `1px solid ${alpha('#ffffff', 0.2)}`,
  bgcolor: alpha('#000000', 0.4),
  boxShadow: `
    inset 0 1px 0 ${alpha('#ffffff', 0.05)},
    0 6px 20px ${alpha('#000000', 0.35)}
  `,
  '&:hover': {
    bgcolor: goldAlpha( 0.1),
    borderColor: goldAlpha( 0.52),
    color: USER_COLORS.gold,
    boxShadow: `
      inset 0 0 20px ${goldAlpha( 0.1)},
      0 0 16px ${goldAlpha( 0.18)},
      0 10px 28px ${alpha('#000000', 0.45)}
    `,
    transform: 'translateY(-1px)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
  '&.Mui-disabled': {
    bgcolor: alpha('#000000', 0.28),
    color: alpha('#ffffff', 0.28),
    borderColor: alpha('#ffffff', 0.1),
  },
};

const watchLiveGlowPulse = keyframes`
  0%, 100% {
    box-shadow:
      inset 0 0 16px ${alpha('#ef4444', 0.1)},
      0 0 12px ${alpha('#ef4444', 0.28)};
    border-color: ${alpha('#ef4444', 0.55)};
  }
  50% {
    box-shadow:
      inset 0 0 26px ${alpha('#ef4444', 0.18)},
      0 0 28px ${alpha('#ef4444', 0.52)};
    border-color: ${USER_COLORS.error};
  }
`;

/** Watch Live only — red glass + pulsing live glow */
export const userWatchLiveButtonSx: SxProps<Theme> = {
  ...createUserGlassToneButtonSx(USER_COLORS.error, '#fca5a5'),
  animation: `${watchLiveGlowPulse} 2.2s ease-in-out infinite`,
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
  },
};

export const userHeaderPillSx: SxProps<Theme> = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.75,
  px: 1.25,
  py: 0.45,
  minHeight: { xs: 34, sm: 36 },
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

/** Stacked uppercase labels for arena form fields (not floating on the border). */
export const userFieldLabelProps = {
  shrink: true,
} as const;

export const userFieldSx: SxProps<Theme> = {
  '& .MuiInputLabel-root': {
    position: 'relative',
    transform: 'none',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: alpha('#ffffff', 0.72),
    mb: 0.85,
    '&.Mui-focused': { color: USER_COLORS.gold },
    '&.MuiInputLabel-shrink': { transform: 'none' },
  },
  '& .MuiOutlinedInput-root': {
    color: USER_COLORS.textPrimary,
    bgcolor: alpha('#000000', 0.55),
    borderRadius: 0,
    fontSize: { xs: 15, md: 14 },
    minHeight: { xs: 52, md: 48 },
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
    '& fieldset': {
      border: `1px solid ${alpha('#ffffff', 0.24)}`,
    },
    '&:hover fieldset': {
      borderColor: alpha('#ffffff', 0.4),
    },
    '&.Mui-focused': {
      bgcolor: alpha('#000000', 0.65),
      boxShadow: `0 0 0 3px ${goldAlpha( 0.18)}`,
    },
    '&.Mui-focused fieldset': {
      borderColor: USER_COLORS.gold,
      borderWidth: '1px',
    },
    '& input::placeholder, & textarea::placeholder': {
      color: alpha('#ffffff', 0.4),
      opacity: 1,
    },
    '& .MuiSelect-select': {
      color: USER_COLORS.textPrimary,
      display: 'flex',
      alignItems: 'center',
      py: 1.35,
    },
    '& .MuiSelect-icon': {
      color: alpha('#ffffff', 0.65),
    },
  },
  '& .MuiFormHelperText-root': {
    ml: 0,
    mt: 0.75,
    fontSize: 12,
    color: alpha('#ffffff', 0.5),
    '&.Mui-error': { color: USER_COLORS.error },
  },
};

/** Dark glass menu / select paper (portaled overlays). */
export const userMenuPaperSx: SxProps<Theme> = {
  mt: 0.75,
  maxHeight: 320,
  borderRadius: 0,
  bgcolor: alpha('#0a0a0a', 0.98),
  border: `1px solid ${alpha('#ffffff', 0.14)}`,
  backdropFilter: 'blur(14px)',
  boxShadow: `0 16px 40px ${alpha('#000000', 0.65)}`,
  '& .MuiMenuItem-root': {
    color: alpha('#ffffff', 0.9),
    fontSize: 14,
    minHeight: 44,
    py: 1.1,
    px: 1.5,
    borderRadius: 0,
    '&:hover': { bgcolor: goldAlpha( 0.12) },
    '&.Mui-selected': {
      bgcolor: goldAlpha( 0.18),
      color: '#ffffff',
      '&:hover': { bgcolor: goldAlpha( 0.24) },
    },
    '&.Mui-disabled': {
      color: alpha('#ffffff', 0.35),
    },
  },
  '& .MuiList-root': {
    py: 0.5,
  },
};

/** Dark glass select menus that escape the user layout (portaled to document root). */
export const userSelectMenuProps = {
  PaperProps: {
    sx: userMenuPaperSx,
  },
};

/** @deprecated Use userPageTitleSx */
export const userSectionTitleSx = userPageTitleSx;

/** @deprecated Use userPageDividerSx */
export const userSectionDividerSx = userPageDividerSx;
