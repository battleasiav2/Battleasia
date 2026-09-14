import type { Theme, SxProps } from '@mui/material/styles';
import type { SystemStyleObject } from '@mui/system';

import { LANDING_V2 } from 'src/sections/home/landing-v2-theme';

/**
 * Zip landing header bar — ink glass + gold hairline, matches home.
 */
export function getHeaderBarSx(isScrolled = false): SystemStyleObject<Theme> {
  return {
    bgcolor: isScrolled ? 'rgba(6,6,7,0.94)' : 'rgba(6,6,7,0.72)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    borderBottom: `1px solid ${isScrolled ? 'rgba(203,251,36,0.22)' : LANDING_V2.hair}`,
    boxShadow: isScrolled ? '0 12px 40px -24px #000' : 'none',
    transition: 'background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
  };
}

/** Default (top of page) header surface */
export const headerBarSx = getHeaderBarSx(false);

export const headerContainerSx: SystemStyleObject<Theme> = {
  minHeight: { xs: 64, md: 72 },
  height: { xs: 64, md: 72 },
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
 * Active nav — gold underline like home zip header (no trapezoid / pill).
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
  px: { lg: 1.75, xl: 2 },
  filter: 'none',
  boxShadow: 'none',
  '&::before': { display: 'none' },
  '&::after': {
    content: '""',
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 10,
    height: '1.5px',
    borderRadius: '2px',
    bgcolor: 'var(--ba-gold)',
  },
  '& .nav-label': {
    position: 'relative',
    zIndex: 1,
    fontFamily: LANDING_V2.display,
    fontWeight: 700,
    fontSize: { lg: 12, xl: 12.5 },
    letterSpacing: '0.11em',
    textTransform: 'uppercase',
    color: LANDING_V2.text,
    textShadow: 'none',
    lineHeight: 1,
    whiteSpace: 'nowrap',
  },
};

/**
 * Inactive nav link matching home zip header.
 */
export const headerInactiveNavLinkSx: SxProps<Theme> = {
  position: 'relative',
  height: '100%',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  textDecoration: 'none',
  cursor: 'pointer',
  px: { lg: 1.75, xl: 2 },
  transition: `color 0.25s ${LANDING_V2.ease}`,
  filter: 'none',
  boxShadow: 'none',
  '& .nav-label': {
    fontFamily: LANDING_V2.display,
    fontWeight: 700,
    fontSize: { lg: 12, xl: 12.5 },
    letterSpacing: '0.11em',
    textTransform: 'uppercase',
    color: LANDING_V2.muted,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    transition: `color 0.25s ${LANDING_V2.ease}`,
  },
  '&:hover': {
    '& .nav-label': {
      color: LANDING_V2.text,
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
  bgcolor: LANDING_V2.hair,
  alignSelf: 'center',
  flexShrink: 0,
};

/**
 * ----------------------------------------------------------------------
 * Header right controls — zip 44×44 glass chips
 * ----------------------------------------------------------------------
 */

/** Outline LOGIN control — matches home zip header */
export const headerSignInButtonSx: SystemStyleObject<Theme> = {
  height: 44,
  minHeight: 44,
  px: { xs: 1.5, sm: 1.75 },
  position: 'relative',
  overflow: 'hidden',
  display: 'inline-flex',
  alignItems: 'center',
  gap: { xs: 0.5, sm: 0.75 },
  textDecoration: 'none',
  fontFamily: LANDING_V2.display,
  fontWeight: 700,
  fontSize: { xs: 11, sm: 12 },
  letterSpacing: '0.10em',
  textTransform: 'uppercase',
  color: LANDING_V2.muted,
  flexShrink: 0,
  bgcolor: 'rgba(255,255,255,0.03)',
  border: `1px solid ${LANDING_V2.hair}`,
  borderRadius: '10px',
  boxShadow: 'none',
  transition: `background-color 0.25s ${LANDING_V2.ease}, border-color 0.25s ${LANDING_V2.ease}, color 0.25s ${LANDING_V2.ease}`,
  '&:hover': {
    bgcolor: 'rgba(255,255,255,0.05)',
    borderColor: LANDING_V2.hair2,
    color: LANDING_V2.text,
  },
  '&:active': {
    bgcolor: 'rgba(255,255,255,0.04)',
  },
};

export const headerSignInIconButtonSx: SystemStyleObject<Theme> = {
  ...headerSignInButtonSx,
  px: { xs: 0.85, sm: 1 },
  width: 44,
  minWidth: 44,
  justifyContent: 'center',
};

/** Language control — zip chip */
export const headerLanguagePillSx = (open: boolean): SystemStyleObject<Theme> => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: { xs: 0.4, sm: 0.65 },
  px: 0,
  py: 0,
  minHeight: 44,
  height: 44,
  width: 44,
  minWidth: 44,
  justifyContent: 'center',
  flexShrink: 0,
  position: 'relative',
  overflow: 'hidden',
  bgcolor: open ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
  border: `1px solid ${open ? LANDING_V2.hair2 : LANDING_V2.hair}`,
  borderRadius: '10px',
  boxShadow: 'none',
  transition: `background-color 0.25s ${LANDING_V2.ease}, border-color 0.25s ${LANDING_V2.ease}`,
  '&:hover': {
    bgcolor: 'rgba(255,255,255,0.05)',
    borderColor: LANDING_V2.hair2,
    '& .lang-chevron': {
      color: LANDING_V2.text,
    },
  },
});

export const headerLanguageCodeSx: SystemStyleObject<Theme> = {
  fontFamily: LANDING_V2.display,
  fontSize: { xs: 11, sm: 12 },
  fontWeight: 700,
  letterSpacing: '0.08em',
  color: LANDING_V2.muted,
  lineHeight: 1,
  textTransform: 'uppercase',
  display: { xs: 'none', sm: 'inline' },
};

/** Accent / theme control */
export const headerAccentButtonSx = (open: boolean): SystemStyleObject<Theme> => ({
  width: 44,
  minWidth: 44,
  height: 44,
  p: 0,
  flexShrink: 0,
  position: 'relative',
  display: 'grid',
  placeItems: 'center',
  bgcolor: open ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
  border: `1px solid ${open ? LANDING_V2.hair2 : LANDING_V2.hair}`,
  borderRadius: '10px',
  boxShadow: 'none',
  transition: `background-color 0.25s ${LANDING_V2.ease}, border-color 0.25s ${LANDING_V2.ease}`,
  '&:hover': {
    bgcolor: 'rgba(255,255,255,0.05)',
    borderColor: LANDING_V2.hair2,
  },
});

export const headerRightStackSx: SystemStyleObject<Theme> = {
  flexShrink: 0,
  height: 1,
  gap: { xs: 0.85, sm: 1.25 },
};

export const headerControlHeight = { xs: 44, sm: 44 } as const;

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
