import type { SxProps, Theme } from '@mui/material/styles';

import { Box } from '@mui/material';

import { LANDING_V2, landingPanelSx } from './landing-v2-theme';

export const HOME_GOLD = 'var(--ba-gold)';

/** Home/dashboard readable text — landing zip tokens */
export const HOME_TEXT_PRIMARY = LANDING_V2.text;
export const HOME_TEXT_SECONDARY = LANDING_V2.muted;
export const HOME_TEXT_MUTED = LANDING_V2.faint;

export const HOME_ROW_LINE = `1px solid ${LANDING_V2.hair}`;

/** Flat blur surface — BattleAsia 2.0 landing zip panel */
export const homeBlurPanelSx: SxProps<Theme> = {
  position: 'relative',
  ...landingPanelSx,
};

/** Pulse glass card fill — zip panel opacity */
export const homeGlassCardSx = {
  bgcolor: LANDING_V2.panel,
  backdropFilter: `blur(${LANDING_V2.blur})`,
  WebkitBackdropFilter: `blur(${LANDING_V2.blur})`,
  border: `1px solid ${LANDING_V2.hair}`,
  borderRadius: LANDING_V2.radius,
} as const;

/** Shared flat blur container — dashboard + home sections */
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
        { p: { xs: 1.5, sm: 1.65, md: 1.75 } },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {children}
    </Box>
  );
}
