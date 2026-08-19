import { Box, Card, Skeleton, Stack, Typography } from '@mui/material';
import { alpha, type SxProps, type Theme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

import { glassShimmerKeyframes, glassShimmerLayer } from './glass-shimmer';
import { GLASS_CARD_RADIUS, GLASS_CARD_RADIUS_SM } from './glass-card-tokens';
import type { GlassCardTokens } from './types';

type GlassStatTileProps = {
  label: string;
  value: React.ReactNode;
  suffix?: string;
  icon?: string;
  loading?: boolean;
  tokens: GlassCardTokens;
};

export function GlassStatTile({ label, value, suffix, icon, loading, tokens }: GlassStatTileProps) {
  const { stat } = tokens;
  const gold = '#f5c518';

  const cardSx: SxProps<Theme> = {
    backgroundImage: 'none',
    color: 'inherit',
    p: { xs: 1.5, sm: 1.75 },
    minHeight: { xs: 96, sm: 108 },
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: `${GLASS_CARD_RADIUS}px`,
    bgcolor: stat.bgcolor,
    backgroundColor: stat.bgcolor,
    border: stat.border,
    boxShadow: stat.boxShadow,
    backdropFilter: 'blur(18px) saturate(1.1)',
    WebkitBackdropFilter: 'blur(18px) saturate(1.1)',
    transition: 'background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      bgcolor: alpha('#000000', 0.48),
      borderColor: alpha(gold, 0.28),
      boxShadow: `inset 0 1px 0 ${alpha('#ffffff', 0.06)}, 0 0 18px ${alpha(gold, 0.12)}`,
    },
    '& > *': { position: 'relative', zIndex: 1 },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 2,
      zIndex: 2,
      background: `linear-gradient(90deg, transparent 0%, ${alpha(gold, 0.35)} 18%, ${gold} 50%, ${alpha(gold, 0.35)} 82%, transparent 100%)`,
      boxShadow: `0 0 14px ${alpha(gold, 0.45)}`,
    },
    ...(stat.shimmer ? glassShimmerKeyframes : {}),
    ...(stat.shimmer ? (glassShimmerLayer as Record<string, unknown>) : {}),
    ...(stat.overlay
      ? {
          '&:after': {
            content: "''",
            position: 'absolute',
            inset: 0,
            background: stat.overlay,
            pointerEvents: 'none',
          },
        }
      : {}),
  };

  const iconBoxSx: SxProps<Theme> = {
    width: { xs: 40, sm: 44 },
    height: { xs: 40, sm: 44 },
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: `${GLASS_CARD_RADIUS_SM}px`,
    bgcolor: alpha(gold, 0.1),
    border: `1px solid ${alpha(gold, 0.32)}`,
    boxShadow: `inset 0 1px 0 ${alpha('#ffffff', 0.06)}`,
    color: gold,
  };

  const labelSx = {
    letterSpacing: 0.7,
    color: stat.labelColor,
    fontSize: { xs: '0.58rem', sm: '0.66rem' },
    lineHeight: 1.25,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    wordBreak: 'break-word' as const,
  };

  const   valueSx = {
    display: 'flex',
    alignItems: 'baseline',
    flexWrap: 'wrap' as const,
    gap: 0.75,
    color: stat.valueColor,
    fontSize: { xs: '1.35rem', sm: '1.5rem', md: '1.65rem' },
    fontWeight: 800,
    lineHeight: 1.15,
  };

  return (
    <Card elevation={0} sx={cardSx}>
      {loading ? (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Skeleton variant="rounded" width={44} height={44} sx={{ borderRadius: `${GLASS_CARD_RADIUS_SM}px` }} />
          <Stack spacing={0.75} sx={{ flex: 1 }}>
            <Skeleton width="55%" sx={{ borderRadius: `${GLASS_CARD_RADIUS_SM}px` }} />
            <Skeleton width="40%" sx={{ borderRadius: `${GLASS_CARD_RADIUS_SM}px` }} />
          </Stack>
        </Stack>
      ) : icon ? (
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box sx={iconBoxSx}>
            <Iconify icon={icon} width={22} />
          </Box>
          <Stack spacing={0.35} sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="overline" sx={labelSx}>
              {label}
            </Typography>
            <Typography variant="h4" sx={valueSx}>
              {value}
              {suffix ? (
                <Typography
                  component="span"
                  variant="subtitle2"
                  sx={{ color: stat.suffixColor, fontSize: { xs: '0.62rem', sm: '0.72rem' }, fontWeight: 600 }}
                >
                  {suffix}
                </Typography>
              ) : null}
            </Typography>
          </Stack>
        </Stack>
      ) : (
        <Stack spacing={0.5}>
          <Typography variant="overline" sx={labelSx}>
            {label}
          </Typography>
          <Typography variant="h4" sx={valueSx}>
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
