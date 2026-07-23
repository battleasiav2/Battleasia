import { Card, type SxProps, type Theme } from '@mui/material';

import { getDefaultGlassTokens, getGlassShellSx } from './glass-shell-styles';

type GlassPanelCardProps = {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
};

export function GlassPanelCard({ children, sx }: GlassPanelCardProps) {
  const tokens = getDefaultGlassTokens();

  return (
    <Card
      elevation={0}
      sx={getGlassShellSx(tokens, {
        p: { xs: 1.5, sm: 2 },
        height: '100%',
        ...(sx as object),
      })}
    >
      {children}
    </Card>
  );
}
