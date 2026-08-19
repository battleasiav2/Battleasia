import { Box, Card, Chip, Grid, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { glassShimmerKeyframes, glassShimmerLayer } from './glass-shimmer';
import { GLASS_CARD_RADIUS, GLASS_CARD_RADIUS_SM } from './glass-card-tokens';
import { GlassStatTile } from './glass-stat-tile';
import type { GlassCardVariant } from './types';
import { GLASS_CARD_VARIANTS } from './variants';
import {
  homeMobileScrollFlexRowSx,
  homeMobileScrollItemSx,
} from 'src/sections/home/home-horizontal-scroll';

export type PulseCardStats = {
  totalWinnings: React.ReactNode;
  processedMatches: React.ReactNode;
  ongoingMatches: React.ReactNode;
};

export type PulseCardLabels = {
  platformTotalWinnings: string;
  processedMatches: string;
  ongoingMatches: string;
};

type PulseCardProps = {
  variant: GlassCardVariant;
  badgeLabel: string;
  title: string;
  description: string;
  liveSuffix: string;
  labels: PulseCardLabels;
  stats: PulseCardStats;
  loading?: boolean;
  showDemoLabel?: boolean;
  lastUpdatedLabel?: string;
};

export function PulseCard({
  variant,
  badgeLabel,
  title,
  description,
  liveSuffix,
  labels,
  stats,
  loading,
  showDemoLabel = false,
  lastUpdatedLabel,
}: PulseCardProps) {
  const tokens = GLASS_CARD_VARIANTS[variant];

  const statTiles = [
    {
      key: 'winnings',
      label: labels.platformTotalWinnings,
      value: stats.totalWinnings,
      suffix: undefined,
      icon: 'solar:wallet-money-bold-duotone',
      xs: 12,
      md: 12,
    },
    {
      key: 'matches',
      label: labels.processedMatches,
      value: stats.processedMatches,
      suffix: undefined,
      icon: 'solar:medal-ribbons-star-bold-duotone',
      xs: 6,
      md: 6,
    },
    {
      key: 'live',
      label: labels.ongoingMatches,
      value: stats.ongoingMatches,
      suffix: liveSuffix,
      icon: 'solar:play-circle-bold-duotone',
      xs: 6,
      md: 6,
    },
  ] as const;

  return (
    <Box>
      {showDemoLabel ? (
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="subtitle2" sx={{ color: '#f5c518', fontWeight: 700, letterSpacing: 0.4 }}>
            {tokens.label}
          </Typography>
          <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.72) }}>
            {tokens.description}
          </Typography>
        </Stack>
      ) : null}

      <Card
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: `${GLASS_CARD_RADIUS}px`,
          position: 'relative',
          overflow: 'hidden',
          bgcolor: tokens.shell.bgcolor,
          border: tokens.shell.border,
          boxShadow: tokens.shell.boxShadow,
          backdropFilter: tokens.shell.backdropFilter,
          WebkitBackdropFilter: tokens.shell.backdropFilter,
          ...(tokens.shell.shimmer ? { ...glassShimmerKeyframes, ...glassShimmerLayer } : {}),
          transition:
            'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.35s ease, box-shadow 0.4s ease',
          '&:hover': {
            transform: 'translateY(-6px)',
            borderColor: 'rgba(245, 197, 24, 0.45)',
            boxShadow:
              '0 22px 48px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(245, 197, 24, 0.2), 0 0 32px rgba(245, 197, 24, 0.12)',
          },
          '&:before': tokens.shell.overlay
            ? {
                content: "''",
                position: 'absolute',
                inset: 0,
                background: tokens.shell.overlay,
                pointerEvents: 'none',
                zIndex: 0,
                animation: tokens.shell.shimmer ? 'glassSparkle 3.2s ease-in-out infinite' : undefined,
              }
            : undefined,
          '& > *': { position: 'relative', zIndex: 1 },
        }}
      >
        <Grid container spacing={{ xs: 2, md: 3 }} alignItems="center">
          <Grid item xs={12} md={7}>
            <Stack spacing={1.25}>
              <Chip
                label={badgeLabel}
                sx={{
                  alignSelf: 'flex-start',
                  borderRadius: `${GLASS_CARD_RADIUS_SM}px`,
                  fontWeight: 700,
                  fontSize: { xs: '0.68rem', sm: '0.76rem' },
                  letterSpacing: 0.6,
                  height: 28,
                  px: 0.5,
                  bgcolor: 'rgba(245, 197, 24, 0.12)',
                  color: '#f5c518',
                  border: '1px solid rgba(245, 197, 24, 0.45)',
                  boxShadow: '0 0 12px rgba(245, 197, 24, 0.1)',
                  '& .MuiChip-label': {
                    px: 1.25,
                    color: '#f5c518',
                    fontWeight: 700,
                  },
                }}
              />
              <Typography
                variant="h4"
                sx={{
                  color: tokens.titleColor,
                  fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: { xs: 0.6, md: 1.2 },
                  wordBreak: 'break-word',
                }}
              >
                {title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: tokens.subtitleColor,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  lineHeight: 1.5,
                  maxWidth: 520,
                }}
              >
                {description}
              </Typography>
              {lastUpdatedLabel ? (
                <Typography
                  variant="caption"
                  sx={{
                    color: alpha('#ffffff', 0.52),
                    fontWeight: 600,
                    letterSpacing: 0.3,
                  }}
                >
                  {lastUpdatedLabel}
                </Typography>
              ) : null}
            </Stack>
          </Grid>

          <Grid item xs={12} md={5}>
            <Box
              sx={{
                gap: 1.25,
                ...homeMobileScrollFlexRowSx,
                display: { xs: 'flex', md: 'none' },
              }}
            >
              {statTiles.map((tile) => (
                <Box
                  key={tile.key}
                  sx={{
                    ...homeMobileScrollItemSx,
                    flex: '0 0 78%',
                    minWidth: 220,
                    maxWidth: 280,
                  }}
                >
                  <GlassStatTile
                    label={tile.label}
                    value={tile.value}
                    suffix={tile.suffix}
                    icon={tile.icon}
                    loading={loading}
                    tokens={tokens}
                  />
                </Box>
              ))}
            </Box>

            <Grid container spacing={1.25} sx={{ display: { xs: 'none', md: 'flex' } }}>
              {statTiles.map((tile) => (
                <Grid key={tile.key} item xs={tile.xs} md={tile.md}>
                  <GlassStatTile
                    label={tile.label}
                    value={tile.value}
                    suffix={tile.suffix}
                    icon={tile.icon}
                    loading={loading}
                    tokens={tokens}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
}
