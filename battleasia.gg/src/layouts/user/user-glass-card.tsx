import type { ReactNode } from 'react';
import type { CardProps } from '@mui/material/Card';

import Card from '@mui/material/Card';
import { alpha } from '@mui/material/styles';

import {
  mergeGlassSx,
  getGoldTopLineShellSx,
} from 'src/components/battle-glass-card';
import { goldAlpha } from 'src/theme/accent-presets';

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
          bgcolor: alpha('#10141c', 0.78),
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: `1px solid ${alpha('#ffffff', 0.09)}`,
          transition: 'border-color 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s cubic-bezier(0.22, 1, 0.36, 1), transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
          '&:hover': {
            borderColor: goldAlpha(0.35),
            boxShadow: `0 14px 34px ${alpha('#000000', 0.65)}, 0 0 20px ${goldAlpha(0.12)}`,
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
