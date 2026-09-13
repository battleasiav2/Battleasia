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
 * Simple active nav pill — Pulse-card style (no trapezoid / gaming badge).
 */
export const headerActiveTrapezoidSx: SxProps<Theme> = {
  position: 'relative',
  height: '100%',
  minWidth: { xs: 88, lg: 96, xl: 104 },
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  textDecoration: 'none',
  cursor: 'pointer',
  px: { lg: 2, xl: 2.25 },
  filter: 'none',
  boxShadow: 'none',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: 6,
    right: 6,
    height: 30,
    transform: 'translateY(-50%)',
    zIndex: 0,
    borderRadius: '4px',
    bgcolor: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.14)',
    boxShadow: 'none',
    filter: 'none',
  },
  '& .nav-label': {
    position: 'relative',
    zIndex: 1,
    fontFamily: "'Barlow', sans-serif",
    fontWeight: 800,
    fontSize: { lg: 14, xl: 14.5 },
    letterSpacing: '1px',
    textTransform: 'uppercase',
    color: 'var(--ba-gold, #cbfb24)',
    textShadow: 'none',
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
 * Header right controls — Pulse-simple chips
 * ----------------------------------------------------------------------
 */

/** Simple Pulse-style Sign-In / Login control */
export const headerSignInButtonSx: SystemStyleObject<Theme> = {
  height: { xs: 32, sm: 34, md: 36 },
  px: { xs: 1, sm: 1.35, md: 1.5 },
  position: 'relative',
  overflow: 'hidden',
  display: 'inline-flex',
  alignItems: 'center',
  gap: { xs: 0.5, sm: 0.75 },
  textDecoration: 'none',
  fontFamily: "'Barlow', sans-serif",
  fontWeight: 700,
  fontSize: { xs: 11, sm: 12, md: 13 },
  letterSpacing: { xs: '0.6px', md: '0.8px' },
  textTransform: 'uppercase',
  color: 'rgba(255, 255, 255, 0.88)',
  flexShrink: 0,
  bgcolor: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '4px',
  boxShadow: 'none',
  transition: 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease',
  '&:hover': {
    bgcolor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.22)',
    color: '#ffffff',
  },
  '&:active': {
    bgcolor: 'rgba(255, 255, 255, 0.06)',
  },
};

export const headerSignInIconButtonSx: SystemStyleObject<Theme> = {
  ...headerSignInButtonSx,
  px: { xs: 0.85, sm: 1 },
  width: { xs: 32, sm: 34, md: 36 },
  justifyContent: 'center',
};

/** Simple language control — Pulse chip style */
export const headerLanguagePillSx = (open: boolean): SystemStyleObject<Theme> => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: { xs: 0.4, sm: 0.65 },
  px: { xs: 0.7, sm: 1, md: 1.15 },
  py: 0,
  minHeight: { xs: 32, sm: 34, md: 36 },
  height: { xs: 32, sm: 34, md: 36 },
  minWidth: 0,
  flexShrink: 0,
  position: 'relative',
  overflow: 'hidden',
  bgcolor: open ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.05)',
  border: `1px solid ${open ? 'rgba(255, 255, 255, 0.22)' : 'rgba(255, 255, 255, 0.12)'}`,
  borderRadius: '4px',
  boxShadow: 'none',
  transition: 'background-color 0.15s ease, border-color 0.15s ease',
  '&:hover': {
    bgcolor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.22)',
    '& .lang-chevron': {
      color: 'rgba(255, 255, 255, 0.85)',
    },
  },
});

export const headerLanguageCodeSx: SystemStyleObject<Theme> = {
  fontFamily: "'Barlow', sans-serif",
  fontSize: { xs: 11, sm: 12, md: 13 },
  fontWeight: 700,
  letterSpacing: { xs: '0.5px', md: '0.7px' },
  color: 'rgba(255, 255, 255, 0.88)',
  lineHeight: 1,
  textTransform: 'uppercase',
  display: { xs: 'none', sm: 'inline' },
};

/** Simple accent / theme control */
export const headerAccentButtonSx = (open: boolean): SystemStyleObject<Theme> => ({
  width: { xs: 30, sm: 34, md: 36 },
  minWidth: { xs: 30, sm: 34, md: 36 },
  height: { xs: 30, sm: 34, md: 36 },
  p: 0,
  flexShrink: 0,
  position: 'relative',
  display: 'grid',
  placeItems: 'center',
  bgcolor: open ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.05)',
  border: `1px solid ${open ? 'rgba(255, 255, 255, 0.22)' : 'rgba(255, 255, 255, 0.12)'}`,
  borderRadius: '4px',
  boxShadow: 'none',
  transition: 'background-color 0.15s ease, border-color 0.15s ease',
  '&:hover': {
    bgcolor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.22)',
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
