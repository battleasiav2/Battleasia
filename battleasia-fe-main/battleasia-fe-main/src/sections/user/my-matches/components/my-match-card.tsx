import { Box, Stack, Button, Typography, Grid2 as Grid } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { CoinValue } from 'src/components/coin-value';
import {
  GLASS_CARD_RADIUS_SM,
  getDefaultGlassTokens,
  getGlassShellSx,
  getGlassBadgeChipSx,
} from 'src/components/battle-glass-card';

import { USER_COLORS, userGoldButtonSx } from 'src/layouts/user';

import { MatchStatPill } from '../../play/components/match-stat-pill';
import type { MyMatchCardData } from '../my-matches-types';

// ----------------------------------------------------------------------

type MyMatchCardTranslations = {
  won: string;
  lost: string;
  pending: string;
  entryFee: string;
  prizeWon: string;
  kills: string;
  rank: string;
  viewDetails: string;
  matchTypePaid: string;
  matchTypeFree: string;
};

type MyMatchCardProps = {
  match: MyMatchCardData;
  onViewDetails: () => void;
  translations: MyMatchCardTranslations;
};

export function MyMatchCard({ match, onViewDetails, translations }: MyMatchCardProps) {
  const tokens = getDefaultGlassTokens();
  const isLoss = match.status === 'loss';
  const isWin = match.status === 'win';

  const statusColor = isWin ? USER_COLORS.success : isLoss ? USER_COLORS.error : USER_COLORS.gold;
  const statusLabel = isWin ? translations.won : isLoss ? translations.lost : translations.pending;

  const matchType = match.matchType?.toLowerCase();
  const matchTypeLabel =
    matchType === 'paid'
      ? translations.matchTypePaid
      : matchType === 'free'
        ? translations.matchTypeFree
        : match.matchType;

  return (
    <Box
      sx={getGlassShellSx(tokens, {
        p: 0,
        overflow: 'hidden',
        height: 1,
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.28s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 20px 48px ${alpha('#000000', 0.75)}, 0 0 28px ${alpha(USER_COLORS.gold, 0.1)}`,
        },
      })}
    >
      <Box sx={{ position: 'relative', height: 148, overflow: 'hidden' }}>
        <Box
          component="img"
          src={match.heroImage}
          alt={match.matchName}
          sx={{
            width: 1,
            height: 1,
            objectFit: 'cover',
            objectPosition: 'center',
            display: 'block',
            filter: isLoss ? 'grayscale(100%)' : 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, transparent 20%, ${alpha('#000000', 0.85)} 100%)`,
          }}
        />

        <Stack
          direction="row"
          spacing={0.75}
          sx={{ position: 'absolute', top: 10, left: 10, right: 10, flexWrap: 'wrap' }}
        >
          <Box
            sx={{
              ...getGlassBadgeChipSx(tokens),
              bgcolor: alpha(USER_COLORS.gold, 0.18),
              border: `1px solid ${alpha(USER_COLORS.gold, 0.35)}`,
            }}
          >
            <Typography sx={{ fontSize: 10, fontWeight: 800, px: 0.5, color: USER_COLORS.gold }}>
              {matchTypeLabel}
            </Typography>
          </Box>
          {match.map ? (
            <Box sx={getGlassBadgeChipSx(tokens)}>
              <Typography sx={{ fontSize: 10, fontWeight: 700, px: 0.5, color: USER_COLORS.textMuted }}>
                {match.map}
              </Typography>
            </Box>
          ) : null}
        </Stack>

        <Box sx={{ position: 'absolute', bottom: 10, right: 10 }}>
          <Box
            sx={{
              ...getGlassBadgeChipSx(tokens),
              bgcolor: alpha(statusColor, 0.2),
              border: `1px solid ${alpha(statusColor, 0.45)}`,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ px: 0.5 }}>
              <Iconify
                icon={
                  isWin
                    ? 'solar:cup-star-bold'
                    : isLoss
                      ? 'solar:close-circle-bold'
                      : 'solar:clock-circle-bold'
                }
                width={12}
                sx={{ color: statusColor }}
              />
              <Typography sx={{ fontSize: 10, fontWeight: 800, color: statusColor }}>
                {statusLabel}
              </Typography>
            </Stack>
          </Box>
        </Box>
      </Box>

      <Stack spacing={1.5} sx={{ p: 2, flex: 1 }}>
        <Box>
          <Typography
            className="font-tr"
            sx={{
              fontSize: 17,
              fontWeight: 800,
              color: USER_COLORS.textPrimary,
              textTransform: 'uppercase',
              lineHeight: 1.15,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {match.matchName}
          </Typography>

          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 0.75 }}>
            <Typography sx={{ fontSize: 12, color: USER_COLORS.gold, fontWeight: 600 }}>
              {match.date}
            </Typography>
            <Typography sx={{ fontSize: 12, color: USER_COLORS.textMuted }}>
              · {match.gameName}
            </Typography>
          </Stack>
        </Box>

        <Grid container spacing={1}>
          <Grid size={6}>
            <MatchStatPill label={translations.entryFee}>
              <CoinValue value={match.entryFee} size={14} />
            </MatchStatPill>
          </Grid>
          <Grid size={6}>
            <MatchStatPill label={translations.prizeWon} minHeight={64}>
              {isWin ? (
                <Box sx={{ color: USER_COLORS.success }}>
                  <CoinValue value={match.prizeWon} size={14} />
                </Box>
              ) : (
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: USER_COLORS.textMuted }}>
                  —
                </Typography>
              )}
            </MatchStatPill>
          </Grid>
          {match.kills !== undefined ? (
            <Grid size={6}>
              <MatchStatPill label={translations.kills}>{match.kills}</MatchStatPill>
            </Grid>
          ) : null}
          {match.rank !== undefined ? (
            <Grid size={6}>
              <MatchStatPill label={translations.rank}>#{match.rank}</MatchStatPill>
            </Grid>
          ) : null}
        </Grid>

        <Button
          fullWidth
          onClick={onViewDetails}
          startIcon={<Iconify icon="solar:eye-bold" width={16} />}
          sx={{
            ...userGoldButtonSx,
            mt: 'auto',
            py: 1.1,
            borderRadius: `${GLASS_CARD_RADIUS_SM}px`,
            bgcolor: alpha(USER_COLORS.gold, 0.14),
            color: USER_COLORS.gold,
            background: 'none',
            border: `1px solid ${alpha(USER_COLORS.gold, 0.4)}`,
            boxShadow: 'none',
            '&:hover': {
              bgcolor: alpha(USER_COLORS.gold, 0.22),
              background: 'none',
            },
          }}
        >
          {translations.viewDetails}
        </Button>
      </Stack>
    </Box>
  );
}
