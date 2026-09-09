import type { Theme, SxProps } from '@mui/material/styles';
import type { SystemStyleObject } from '@mui/system';

import { alpha } from '@mui/material/styles';

/**
 * Tactical military/sci-fi gaming header bar — matching Lost Light aesthetic.
 * Slightly taller bar for easier tap targets and clearer branding.
 */
export function getHeaderBarSx(isScrolled = false): SystemStyleObject<Theme> {
  return {
    bgcolor: isScrolled ? alpha('#050709', 0.98) : alpha('#07080b', 0.95),
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
    boxShadow: isScrolled ? '0 8px 24px rgba(0, 0, 0, 0.65)' : 'none',
    transition: 'background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
  };
}

/** Default (top of page) header surface */
export const headerBarSx = getHeaderBarSx(false);

export const headerContainerSx: SystemStyleObject<Theme> = {
  minHeight: { xs: 50, md: 58 },
  height: { xs: 50, md: 58 },
  px: { xs: 1.25, sm: 2, md: 3 },
  py: 0,
  alignItems: 'center',
  display: { xs: 'flex', lg: 'grid' },
  gridTemplateColumns: { lg: 'minmax(0, 1fr) auto minmax(0, 1fr)' },
  columnGap: { lg: 2 },
  width: '100%',
  maxWidth: '100%',
  boxSizing: 'border-box',
  minWidth: 0,
};

export const headerLeftAreaSx: SystemStyleObject<Theme> = {
  justifySelf: { lg: 'start' },
  minWidth: 0,
  pl: { xs: 0.25, sm: 0 },
};

export const headerCenterAreaSx: SystemStyleObject<Theme> = {
  display: { xs: 'none', lg: 'flex' },
  flex: { lg: 'unset' },
  width: { lg: 'auto' },
  justifySelf: { lg: 'center' },
  justifyContent: 'center',
  alignItems: 'stretch',
  overflow: 'visible',
  height: '100%',
};

export const headerRightAreaSx: SystemStyleObject<Theme> = {
  justifySelf: { lg: 'end' },
  flexShrink: 0,
  minWidth: 0,
};

/**
 * Tactical gaming active trapezoid badge:
 * Proportioned to match Lost Light reference.
 */
export const headerActiveTrapezoidSx: SxProps<Theme> = {
  position: 'relative',
  height: '100%',
  minWidth: { xs: 128, lg: 136, xl: 148 },
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  textDecoration: 'none',
  cursor: 'pointer',
  px: { lg: 3.75, xl: 4.25 },
  filter: 'none',
  boxShadow: 'none',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 0,
    clipPath:
      'polygon(0 0, 100% 0, calc(100% - 26px) 100%, calc(50% + 8px) 100%, 50% calc(100% - 7px), calc(50% - 8px) 100%, 26px 100%)',
    background:
      'linear-gradient(180deg, var(--ba-nav-badge-light, #e2ff58) 0%, var(--ba-nav-badge-main, #cbfb24) 100%)',
    boxShadow: 'none',
    filter: 'none',
  },
  '& .nav-label': {
    position: 'relative',
    zIndex: 1,
    fontFamily: "'Barlow', sans-serif",
    fontWeight: 800,
    fontSize: { lg: 15, xl: 15.5 },
    letterSpacing: '1.2px',
    textTransform: 'uppercase',
    color: '#ffffff',
    textShadow: '0 1px 3px rgba(0, 0, 0, 0.45)',
    lineHeight: 1,
    whiteSpace: 'nowrap',
  },
};

/**
 * Inactive nav link matching reference.
 */
export const headerInactiveNavLinkSx: SxProps<Theme> = {
  position: 'relative',
  height: '100%',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  textDecoration: 'none',
  cursor: 'pointer',
  px: { lg: 2.5, xl: 3 },
  transition: 'color 0.15s ease',
  filter: 'none',
  boxShadow: 'none',
  '& .nav-label': {
    fontFamily: "'Barlow', sans-serif",
    fontWeight: 600,
    fontSize: { lg: 14.5, xl: 15 },
    letterSpacing: '1.2px',
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.68)',
    lineHeight: 1,
    whiteSpace: 'nowrap',
    transition: 'color 0.15s ease',
  },
  '&:hover': {
    '& .nav-label': {
      color: '#ffffff',
    },
  },
};

/** Shared getter for nav link styles */
export function getHeaderNavLinkSx(isActive: boolean): SxProps<Theme> {
  return isActive ? headerActiveTrapezoidSx : headerInactiveNavLinkSx;
}

/** Thin tactical divider between nav links */
export const headerNavDividerSx: SystemStyleObject<Theme> = {
  width: '1px',
  height: '16px',
  bgcolor: 'rgba(255, 255, 255, 0.14)',
  alignSelf: 'center',
  flexShrink: 0,
};

/**
 * ----------------------------------------------------------------------
 * TACTICAL CYBERPUNK HUD RIGHT CONTROLS
 * Creative, modern, animated, full of cyber-military effects
 * ----------------------------------------------------------------------
 */

/** Tactical Cyber Sign-In / Login Button with Holographic Shimmer */
export const headerSignInButtonSx: SystemStyleObject<Theme> = {
  height: { xs: 32, sm: 36, md: 40 },
  px: { xs: 1, sm: 1.5, md: 2 },
  position: 'relative',
  overflow: 'hidden',
  display: 'inline-flex',
  alignItems: 'center',
  gap: { xs: 0.5, sm: 0.85 },
  textDecoration: 'none',
  fontFamily: "'Barlow', sans-serif",
  fontWeight: 800,
  fontSize: { xs: 11, sm: 13, md: 14 },
  letterSpacing: { xs: '0.8px', md: '1.4px' },
  textTransform: 'uppercase',
  color: '#ffffff',
  flexShrink: 0,
  background:
    'linear-gradient(135deg, rgba(255, 255, 255, 0.09) 0%, rgba(18, 22, 28, 0.9) 45%, rgba(6, 8, 12, 0.98) 100%)',
  border: '1px solid rgba(255, 255, 255, 0.16)',
  borderRadius: '2px',
  clipPath: 'polygon(7px 0, 100% 0, 100% calc(100% - 7px), calc(100% - 7px) 100%, 0 100%, 0 7px)',
  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 2px 8px rgba(0, 0, 0, 0.45)',
  transition: 'all 0.22s cubic-bezier(0.2, 0.9, 0.3, 1)',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '45%',
    height: '100%',
    background:
      'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.25) 50%, transparent 100%)',
    animation: 'cyber-shimmer 4.2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
    pointerEvents: 'none',
  },
  '&:hover': {
    borderColor: 'var(--ba-nav-badge-main, #cbfb24)',
    color: '#ffffff',
    transform: 'translateY(-1.5px)',
    boxShadow:
      '0 0 18px rgba(203, 251, 36, 0.35), inset 0 0 12px rgba(203, 251, 36, 0.12), 0 4px 14px rgba(0, 0, 0, 0.6)',
  },
  '&:active': {
    transform: 'translateY(0.5px) scale(0.98)',
  },
};

export const headerSignInIconButtonSx: SystemStyleObject<Theme> = {
  ...headerSignInButtonSx,
  px: { xs: 0.85, sm: 1.15 },
  width: { xs: 32, sm: 36, md: 40 },
  justifyContent: 'center',
};

/** Tactical Cyber Comms Module for Language Popover */
export const headerLanguagePillSx = (open: boolean): SystemStyleObject<Theme> => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: { xs: 0.4, sm: 0.85 },
  px: { xs: 0.7, sm: 1.1, md: 1.35 },
  py: 0,
  minHeight: { xs: 32, sm: 36, md: 40 },
  height: { xs: 32, sm: 36, md: 40 },
  minWidth: 0,
  flexShrink: 0,
  position: 'relative',
  overflow: 'hidden',
  background: open
    ? 'linear-gradient(135deg, rgba(203, 251, 36, 0.14) 0%, rgba(14, 18, 24, 0.92) 50%, rgba(6, 8, 12, 0.98) 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(14, 18, 24, 0.85) 50%, rgba(6, 8, 12, 0.95) 100%)',
  border: `1px solid ${open ? 'var(--ba-nav-badge-main, #cbfb24)' : 'rgba(255, 255, 255, 0.15)'}`,
  borderRadius: '2px',
  clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)',
  boxShadow: open
    ? '0 0 14px rgba(203, 251, 36, 0.3), inset 0 0 8px rgba(203, 251, 36, 0.1)'
    : 'inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 2px 6px rgba(0, 0, 0, 0.4)',
  transition: 'all 0.22s cubic-bezier(0.2, 0.9, 0.3, 1)',
  '&:hover': {
    borderColor: 'var(--ba-nav-badge-main, #cbfb24)',
    boxShadow:
      '0 0 14px rgba(203, 251, 36, 0.28), inset 0 0 8px rgba(203, 251, 36, 0.08)',
    transform: 'translateY(-1.5px)',
    '& .lang-chevron': {
      transform: 'translateY(1.5px)',
      color: 'var(--ba-nav-badge-main, #cbfb24)',
    },
  },
  '&:active': {
    transform: 'translateY(0.5px) scale(0.98)',
  },
});

export const headerLanguageCodeSx: SystemStyleObject<Theme> = {
  fontFamily: "'Barlow', sans-serif",
  fontSize: { xs: 11, sm: 13, md: 14 },
  fontWeight: 800,
  letterSpacing: { xs: '0.6px', md: '1px' },
  color: '#ffffff',
  lineHeight: 1,
  textTransform: 'uppercase',
  // Compact on the narrowest phones — flag alone is enough.
  display: { xs: 'none', sm: 'inline' },
};

/** Tactical Plasma Reactor Core Button for Accent Popover */
export const headerAccentButtonSx = (open: boolean): SystemStyleObject<Theme> => ({
  width: { xs: 30, sm: 36, md: 40 },
  minWidth: { xs: 30, sm: 36, md: 40 },
  height: { xs: 30, sm: 36, md: 40 },
  p: 0,
  flexShrink: 0,
  position: 'relative',
  display: 'grid',
  placeItems: 'center',
  background: open
    ? 'linear-gradient(135deg, rgba(var(--ba-gold-rgb, 203, 251, 36), 0.18) 0%, rgba(14, 18, 24, 0.95) 50%, rgba(6, 8, 12, 0.98) 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(14, 18, 24, 0.85) 50%, rgba(6, 8, 12, 0.95) 100%)',
  border: `1px solid ${open ? 'var(--ba-gold, #cbfb24)' : 'rgba(255, 255, 255, 0.15)'}`,
  borderRadius: '2px',
  clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)',
  boxShadow: open
    ? '0 0 16px rgba(var(--ba-gold-rgb, 203, 251, 36), 0.35)'
    : 'inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 2px 6px rgba(0, 0, 0, 0.4)',
  transition: 'all 0.22s cubic-bezier(0.2, 0.9, 0.3, 1)',
  '&:hover': {
    borderColor: 'var(--ba-gold, #cbfb24)',
    boxShadow:
      '0 0 18px rgba(var(--ba-gold-rgb, 203, 251, 36), 0.35), inset 0 0 8px rgba(var(--ba-gold-rgb, 203, 251, 36), 0.12)',
    transform: 'translateY(-1.5px)',
    '& .reactor-orbit': {
      animationDuration: '3.5s',
      borderColor: 'var(--ba-gold, #cbfb24)',
    },
    '& .reactor-core': {
      transform: 'scale(1.2)',
    },
  },
  '&:active': {
    transform: 'translateY(0.5px) scale(0.98)',
  },
});

export const headerRightStackSx: SystemStyleObject<Theme> = {
  flexShrink: 0,
  height: 1,
  gap: { xs: 0.85, sm: 1.25 },
};

export const headerControlHeight = { xs: 34, sm: 36 } as const;

export const headerCompactSearchSx: SystemStyleObject<Theme> = {
  height: headerControlHeight,
  minHeight: headerControlHeight,
  maxHeight: headerControlHeight,
  alignItems: 'center',
  '& .MuiIconButton-root': {
    width: 36,
    height: 36,
    p: 0.5,
  },
};
