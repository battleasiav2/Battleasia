import type { SxProps, Theme } from '@mui/material/styles';

import { Box } from '@mui/material';

export const HOME_GOLD = '#f5c518';

/** Home/dashboard readable text scale — WCAG AA on #161618 / #0a0a0a */
export const HOME_TEXT_PRIMARY = '#ffffff';
export const HOME_TEXT_SECONDARY = '#D1D5DB';
export const HOME_TEXT_MUTED = '#9CA3AF';

export const HOME_ROW_LINE = '1px solid rgba(255, 255, 255, 0.08)';

/** Flat blur surface — shared by home sections + auth card */
export const homeBlurPanelSx: SxProps<Theme> = {
  position: 'relative',
  bgcolor: 'rgba(22,22,24,0.38)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: '18px',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
};

export function HomeBlurPanel({
  children,
  sx,
}: {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}) {
  return (
    <Box
      sx={[
        homeBlurPanelSx,
        { p: { xs: 1.35, sm: 1.65 } },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {children}
    </Box>
  );
}
