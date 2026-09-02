import type { SxProps, Theme } from '@mui/material/styles';
import type { SystemStyleObject } from '@mui/system';

import { alpha } from '@mui/material/styles';

import { goldAlpha } from 'src/theme/accent-presets';
import { USER_COLORS } from 'src/layouts/user/user-theme';

const GOLD = USER_COLORS.gold;

/** Slim Hostinger-style bar — BattleAsia dark palette */
export function getHeaderBarSx(isScrolled = false): SystemStyleObject<Theme> {
  return {
    bgcolor: alpha('#0a0a0a', isScrolled ? 0.92 : 0.76),
    backdropFilter: isScrolled ? 'blur(8px)' : 'none',
    WebkitBackdropFilter: isScrolled ? 'blur(8px)' : 'none',
    borderBottom: `1px solid ${isScrolled ? goldAlpha(0.1) : alpha('#ffffff', 0.05)}`,
    boxShadow: 'none',
    transition:
      'background-color 0.22s ease, backdrop-filter 0.22s ease, border-color 0.22s ease',
  };
}

/** Default (top of page) header surface */
export const headerBarSx = getHeaderBarSx(false);

export const headerContainerSx: SystemStyleObject<Theme> = {
  minHeight: { xs: 52, md: 56 },
  height: { xs: 52, md: 56 },
  px: { xs: 2, sm: 2.5, md: 3 },
  py: 0,
  alignItems: 'center',
  // Mobile: flex (nav hidden). Desktop: equal side columns so nav sits in true page center.
  display: { xs: 'flex', lg: 'grid' },
  gridTemplateColumns: { lg: 'minmax(0, 1fr) auto minmax(0, 1fr)' },
  columnGap: { lg: 2 },
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
  alignItems: 'center',
  overflow: 'visible',
  height: 1,
};

export const headerRightAreaSx: SystemStyleObject<Theme> = {
  justifySelf: { lg: 'end' },
  flexShrink: 0,
  minWidth: 0,
};

/** Clean inline nav links — no glow underline */
export function getHeaderNavLinkSx(isActive: boolean): SxProps<Theme> {
  return {
    textTransform: 'none',
    fontSize: { lg: 14, xl: 15 },
    fontWeight: isActive ? 600 : 500,
    letterSpacing: 0,
    color: isActive ? GOLD : alpha('#ffffff', 0.72),
    textDecoration: 'none',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    lineHeight: 1.2,
    py: 0.5,
    transition: 'color 0.15s ease',
    '&:hover': {
      color: GOLD,
    },
  };
}

export const headerSignInIconButtonSx: SystemStyleObject<Theme> = {
  width: { xs: 36, sm: 38 },
  height: { xs: 36, sm: 38 },
  p: 0,
  color: alpha('#ffffff', 0.88),
  borderRadius: '50%',
  border: `1px solid ${alpha('#ffffff', 0.12)}`,
  transition: 'color 0.15s ease, background-color 0.15s ease, border-color 0.15s ease',
  '&:hover': {
    color: GOLD,
    bgcolor: goldAlpha(0.08),
    borderColor: goldAlpha(0.32),
  },
};

export const headerLanguagePillSx = (open: boolean): SystemStyleObject<Theme> => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.75,
  px: 1.1,
  py: 0.45,
  minHeight: 34,
  borderRadius: '999px',
  bgcolor: open ? alpha('#ffffff', 0.1) : alpha('#ffffff', 0.06),
  border: `1px solid ${open ? goldAlpha(0.28) : alpha('#ffffff', 0.1)}`,
  transition: 'background-color 0.15s ease, border-color 0.15s ease',
  '&:hover': {
    bgcolor: alpha('#ffffff', 0.1),
    borderColor: alpha('#ffffff', 0.16),
  },
});

export const headerLanguageCodeSx: SystemStyleObject<Theme> = {
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: 0.02,
  color: alpha('#ffffff', 0.88),
  lineHeight: 1,
  textTransform: 'uppercase',
};

export const headerRightStackSx: SystemStyleObject<Theme> = {
  flexShrink: 0,
  height: 1,
  gap: { xs: 1, sm: 1.25 },
};

/** Shared compact control height for header icon buttons / search trigger */
export const headerControlHeight = { xs: 34, sm: 36 } as const;

export const headerCompactSearchSx: SystemStyleObject<Theme> = {
  height: headerControlHeight,
  minHeight: headerControlHeight,
  maxHeight: headerControlHeight,
  alignItems: 'center',
  '& .MuiIconButton-root': {
    width: 32,
    height: 32,
    p: 0.5,
  },
};
