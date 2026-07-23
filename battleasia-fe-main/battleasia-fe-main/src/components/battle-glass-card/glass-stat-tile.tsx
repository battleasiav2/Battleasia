import { Card, Skeleton, Stack, Typography } from '@mui/material';
import { alpha, type SxProps, type Theme } from '@mui/material/styles';

import { glassShimmerKeyframes, glassShimmerLayer } from './glass-shimmer';
import { GLASS_CARD_RADIUS } from './glass-card-tokens';
import type { GlassCardTokens } from './types';

type GlassStatTileProps = {
  label: string;
  value: React.ReactNode;
  suffix?: string;
  loading?: boolean;
  tokens: GlassCardTokens;
};

export function GlassStatTile({ label, value, suffix, loading, tokens }: GlassStatTileProps) {
  const { stat } = tokens;

  const cardSx: SxProps<Theme> = {
    backgroundImage: 'none',
    color: 'inherit',
    p: { xs: 1.5, sm: 2.25 },
    minHeight: { xs: 96, sm: 132 },
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 0.5,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: `${GLASS_CARD_RADIUS}px`,
    bgcolor: stat.bgcolor,
    backgroundColor: stat.bgcolor,
    border: stat.border,
    boxShadow: stat.boxShadow,
    backdropFilter: 'blur(18px) saturate(1.1)',
    WebkitBackdropFilter: 'blur(18px) saturate(1.1)',
    transition: 'background-color 0.2s ease, border-color 0.2s ease',
    '&:hover': {
      bgcolor: alpha('#000000', 0.48),
      borderColor: alpha('#ffffff', 0.16),
    },
    '& > *': { position: 'relative', zIndex: 1 },
    ...(stat.shimmer ? glassShimmerKeyframes : {}),
    ...(stat.shimmer ? (glassShimmerLayer as Record<string, unknown>) : {}),
    ...(stat.overlay
      ? {
          '&:before': {
            content: "''",
            position: 'absolute',
            inset: 0,
            background: stat.overlay,
            pointerEvents: 'none',
          },
        }
      : {}),
  };

  return (
    <Card elevation={0} sx={cardSx}>
      {loading ? (
        <Stack spacing={1}>
          <Skeleton width="50%" sx={{ borderRadius: `${GLASS_CARD_RADIUS}px` }} />
          <Skeleton width="70%" sx={{ borderRadius: `${GLASS_CARD_RADIUS}px` }} />
        </Stack>
      ) : (
        <Stack spacing={0.5}>
          <Typography
            variant="overline"
            sx={{
              letterSpacing: 0.6,
              color: stat.labelColor,
              fontSize: { xs: '0.62rem', sm: '0.72rem' },
              lineHeight: 1.3,
              wordBreak: 'break-word',
            }}
          >
            {label}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              display: 'flex',
              alignItems: 'baseline',
              flexWrap: 'wrap',
              gap: 0.75,
              color: stat.valueColor,
              fontSize: { xs: '1.2rem', sm: '1.45rem', md: '1.85rem' },
              fontWeight: 700,
            }}
          >
            {value}
            {suffix ? (
              <Typography
                component="span"
                variant="subtitle2"
                sx={{ color: stat.suffixColor, fontSize: { xs: '0.68rem', sm: '0.8rem' }, fontWeight: 600 }}
              >
                {suffix}
              </Typography>
            ) : null}
          </Typography>
        </Stack>
      )}
    </Card>
  );
}
