import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { CoinValue } from 'src/components/coin-value';

import { goldAlpha, USER_COLORS } from 'src/layouts/user';

import type { MyMatchCardData } from '../my-matches-types';

// ----------------------------------------------------------------------

const GOLD = USER_COLORS.gold;

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
  /** Last row in a merged list — hide bottom divider */
  isLast?: boolean;
};

/** Shop-style horizontal row — no nested boxes, flat monochrome accents. */
export function MyMatchCard({ match, onViewDetails, translations, isLast = false }: MyMatchCardProps) {
  const isLoss = match.status === 'loss';
  const isWin = match.status === 'win';

  const statusColor = isWin
    ? USER_COLORS.success
    : isLoss
      ? USER_COLORS.error
      : GOLD;
  const statusLabel = isWin ? translations.won : isLoss ? translations.lost : translations.pending;

  const matchType = match.matchType?.toLowerCase();
  const matchTypeLabel =
    matchType === 'paid'
      ? translations.matchTypePaid
      : matchType === 'free'
        ? translations.matchTypeFree
        : match.matchType;

  const metaBits = [
    match.date,
    match.gameName,
    matchTypeLabel,
    match.kills !== undefined ? `${translations.kills} ${match.kills}` : null,
    match.rank !== undefined ? `${translations.rank} #${match.rank}` : null,
  ].filter(Boolean);

  return (
    <Box
      component="button"
      type="button"
      onClick={onViewDetails}
      sx={{
        all: 'unset',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 1.25, sm: 1.75 },
        width: 1,
        px: { xs: 1.5, sm: 2 },
        py: { xs: 1.25, sm: 1.5 },
        cursor: 'pointer',
        borderBottom: isLast ? 'none' : `1px solid ${alpha('#ffffff', 0.08)}`,
        transition: 'background-color 0.2s ease',
        '&:hover': {
          bgcolor: goldAlpha(0.06),
          '& .match-title': { color: GOLD },
          '& .match-chevron': { color: GOLD, transform: 'translateX(3px)' },
        },
      }}
    >
      <Box
        component="img"
        src={match.heroImage}
        alt=""
        sx={{
          width: { xs: 56, sm: 72 },
          height: { xs: 56, sm: 72 },
          flexShrink: 0,
          objectFit: 'cover',
          bgcolor: '#0a0a0a',
          filter: isLoss ? 'grayscale(100%)' : 'none',
          border: `1px solid ${alpha('#ffffff', 0.1)}`,
        }}
      />

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
          <Typography
            className="match-title font-tr"
            sx={{
              fontSize: { xs: 13, sm: 15 },
              fontWeight: 800,
              color: USER_COLORS.textPrimary,
              textTransform: 'uppercase',
              lineHeight: 1.2,
              transition: 'color 0.2s ease',
            }}
          >
            {match.matchName}
          </Typography>
          <Typography
            sx={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: 0.6,
              textTransform: 'uppercase',
              color: statusColor,
            }}
          >
            {statusLabel}
          </Typography>
        </Stack>

        <Typography
          sx={{
            mt: 0.5,
            fontSize: { xs: 11, sm: 12 },
            color: alpha('#ffffff', 0.5),
            lineHeight: 1.35,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {metaBits.join(' · ')}
        </Typography>
      </Box>

      <Stack alignItems="flex-end" spacing={0.35} sx={{ flexShrink: 0, display: { xs: 'none', sm: 'flex' } }}>
        <Typography sx={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.6, color: alpha('#ffffff', 0.4), textTransform: 'uppercase' }}>
          {isWin ? translations.prizeWon : translations.entryFee}
        </Typography>
        {isWin ? (
          <Box sx={{ color: USER_COLORS.success }}>
            <CoinValue value={match.prizeWon} size={14} />
          </Box>
        ) : (
          <CoinValue value={match.entryFee} size={14} />
        )}
      </Stack>

      <Iconify
        className="match-chevron"
        icon="solar:alt-arrow-right-bold"
        width={16}
        sx={{
          flexShrink: 0,
          color: alpha('#ffffff', 0.35),
          transition: 'color 0.2s ease, transform 0.2s ease',
        }}
      />
    </Box>
  );
}
