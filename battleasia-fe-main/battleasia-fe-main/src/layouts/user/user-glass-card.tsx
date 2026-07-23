import type { ReactNode } from 'react';

import type { CardProps } from '@mui/material/Card';

import Card from '@mui/material/Card';

import {
  getDefaultGlassTokens,
  getGlassShellSx,
  mergeGlassSx,
} from 'src/components/battle-glass-card';

// ----------------------------------------------------------------------

type UserGlassCardProps = CardProps & {
  children: ReactNode;
  noPadding?: boolean;
};

export function UserGlassCard({ children, sx, noPadding, ...other }: UserGlassCardProps) {
  const tokens = getDefaultGlassTokens();

  return (
    <Card
      elevation={0}
      sx={mergeGlassSx(
        getGlassShellSx(tokens, {
          p: noPadding ? 0 : { xs: 1.5, sm: 2 },
          height: 'auto',
        }),
        sx
      )}
      {...other}
    >
      {children}
    </Card>
  );
}
