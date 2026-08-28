import type { SxProps, Theme } from '@mui/material/styles';

import { alpha } from '@mui/material/styles';

import { USER_COLORS } from 'src/layouts/user/user-theme';

const GOLD = USER_COLORS.gold;

export const headerLanguagePillSx = (open: boolean): SxProps<Theme> => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.75,
  px: 1.1,
  py: 0.45,
  minHeight: 34,
  borderRadius: '999px',
  bgcolor: open ? alpha('#ffffff', 0.1) : alpha('#ffffff', 0.06),
  border: `1px solid ${open ? alpha(GOLD, 0.28) : alpha('#ffffff', 0.1)}`,
  transition: 'background-color 0.15s ease, border-color 0.15s ease',
  '&:hover': {
    bgcolor: alpha('#ffffff', 0.1),
    borderColor: alpha('#ffffff', 0.16),
  },
});

export const headerLanguageCodeSx: SxProps<Theme> = {
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: 0.02,
  color: alpha('#ffffff', 0.88),
  lineHeight: 1,
  textTransform: 'uppercase',
};
