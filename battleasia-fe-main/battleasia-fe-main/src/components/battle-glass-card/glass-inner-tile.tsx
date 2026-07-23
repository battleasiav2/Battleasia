import { Card, type SxProps, type Theme } from '@mui/material';

import { getDefaultGlassTokens, getGlassInnerSx } from './glass-shell-styles';

type GlassInnerTileProps = {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
};

export function GlassInnerTile({ children, sx }: GlassInnerTileProps) {
  const tokens = getDefaultGlassTokens();

  return (
    <Card
      elevation={0}
      variant="outlined"
      sx={getGlassInnerSx(tokens, {
        p: { xs: 1.25, sm: 1.75 },
        transition: 'all 0.25s ease',
        ...(sx as object),
      })}
    >
      {children}
    </Card>
  );
}
