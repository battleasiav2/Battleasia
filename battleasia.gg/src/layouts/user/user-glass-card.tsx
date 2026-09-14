import type { ReactNode } from 'react';
import type { CardProps } from '@mui/material/Card';

import Card from '@mui/material/Card';

import {
  mergeGlassSx,
  getGoldTopLineShellSx,
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
          bgcolor: 'rgba(22,22,24,0.38)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 30px 80px -44px #000, inset 0 1px 0 rgba(255,255,255,0.05)',
          transition: 'border-color 0.25s cubic-bezier(0.22, 0.61, 0.36, 1), background-color 0.25s ease',
          '&:hover': {
            bgcolor: 'rgba(30,30,33,0.55)',
            borderColor: 'rgba(255,255,255,0.14)',
          },
        }),
        sx
      )}
      {...other}
    >
      {children}
    </Card>
  );
}
