import { Box, Card, Skeleton, Stack, Typography } from '@mui/material';
import { alpha, type SxProps, type Theme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

import { GLASS_CARD_RADIUS_SM, GLASS_STAT_TILE_RADIUS } from './glass-card-tokens';
import type { GlassCardTokens } from './types';

const GOLD = '#f5c518';

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

  const cardSx: SxProps<Theme> = {
    backgroundImage: 'none',
    color: 'inherit',
    p: { xs: 1.5, sm: 1.75 },
    minHeight: { xs: 96, sm: 108 },
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: `${GLASS_STAT_TILE_RADIUS}px`,
    bgcolor: stat.bgcolor,
    backgroundColor: stat.bgcolor,
    border: stat.border,
    boxShadow: 'none',
    '& > *': { position: 'relative', zIndex: 1 },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 2,
      zIndex: 2,
      bgcolor: GOLD,
      backgroundColor: GOLD,
    },
  };

  const iconBoxSx: SxProps<Theme> = {
    width: { xs: 36, sm: 40 },
    height: { xs: 36, sm: 40 },
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: `${GLASS_CARD_RADIUS_SM}px`,
    bgcolor: alpha(GOLD, 0.08),
    border: `1px solid ${alpha(GOLD, 0.22)}`,
    color: GOLD,
  };

  const labelSx = {
    letterSpacing: 0.7,
    color: stat.labelColor,
    fontSize: { xs: '0.55rem', sm: '0.64rem' },
    lineHeight: 1.25,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    wordBreak: 'break-word' as const,
  };

  const valueSx = {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'nowrap' as const,
    gap: 0.5,
    minWidth: 0,
    maxWidth: '100%',
    overflow: 'hidden',
    color: stat.valueColor,
    fontSize: {
      xs: 'clamp(0.92rem, 3.6vw, 1.15rem)',
      sm: '1.28rem',
      md: '1.42rem',
    },
    fontWeight: 800,
    lineHeight: 1.1,
    '& > *': {
      minWidth: 0,
      maxWidth: '100%',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
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
        <Stack direction="row" spacing={1.1} alignItems="center">
          <Box sx={iconBoxSx}>
            <Iconify icon={icon} width={20} />
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
