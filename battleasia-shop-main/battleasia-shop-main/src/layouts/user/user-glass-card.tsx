import type { ReactNode } from 'react';
import type { CardProps } from '@mui/material/Card';

import Card from '@mui/material/Card';

import {
  getGoldTopLineShellSx,
  mergeGlassSx,
} from 'src/components/battle-glass-card';

// ----------------------------------------------------------------------

type UserGlassCardProps = CardProps & {
  children: ReactNode;
  noPadding?: boolean;
};

export function UserGlassCard({ children, sx, noPadding, ...other }: UserGlassCardProps) {
  return (
    <Card
      elevation={0}
      sx={mergeGlassSx(
        getGoldTopLineShellSx({
          p: noPadding ? 0 : { xs: 1.5, sm: 2 },
          pt: noPadding ? 0 : { xs: 2, sm: 2.25 },
          height: 'auto',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
        }),
        sx
      )}
      {...other}
    >
      {children}
    </Card>
  );
}
