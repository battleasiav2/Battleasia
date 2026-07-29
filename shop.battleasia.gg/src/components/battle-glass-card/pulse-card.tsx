import { Box, Card, Chip, Grid, Stack, Typography } from '@mui/material';

import { glassShimmerKeyframes, glassShimmerLayer } from './glass-shimmer';
import { GLASS_CARD_RADIUS, GLASS_CARD_RADIUS_SM } from './glass-card-tokens';
import { GlassStatTile } from './glass-stat-tile';
import type { GlassCardVariant } from './types';
import { GLASS_CARD_VARIANTS } from './variants';

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
}: PulseCardProps) {
  const tokens = GLASS_CARD_VARIANTS[variant];

  return (
    <Box>
      {showDemoLabel ? (
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="subtitle2" sx={{ color: '#f5c518', fontWeight: 700, letterSpacing: 0.4 }}>
            {tokens.label}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
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
                  bgcolor: tokens.badge.bgcolor,
                  color: tokens.badge.color,
                  border: tokens.badge.border,
                  boxShadow: tokens.badge.boxShadow,
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  '& .MuiChip-label': { px: 1.25 },
                }}
              />
              <Typography
                variant="h4"
                sx={{
                  color: tokens.titleColor,
                  fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
                  fontWeight: 800,
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
            </Stack>
          </Grid>

          <Grid item xs={12} md={5}>
            <Grid container spacing={1.25}>
              <Grid item xs={12} sm={4} md={12}>
                <GlassStatTile
                  label={labels.platformTotalWinnings}
                  value={stats.totalWinnings}
                  loading={loading}
                  tokens={tokens}
                />
              </Grid>
              <Grid item xs={6} sm={4} md={6}>
                <GlassStatTile
                  label={labels.processedMatches}
                  value={stats.processedMatches}
                  loading={loading}
                  tokens={tokens}
                />
              </Grid>
              <Grid item xs={6} sm={4} md={6}>
                <GlassStatTile
                  label={labels.ongoingMatches}
                  value={stats.ongoingMatches}
                  suffix={liveSuffix}
                  loading={loading}
                  tokens={tokens}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
}
