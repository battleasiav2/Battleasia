import { Box, Stack, Avatar, Typography, Chip } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import CoinValue from 'src/components/coin-value';
import { getDefaultGlassTokens, getGlassInnerSx } from 'src/components/battle-glass-card';

import { USER_COLORS, UserEmptyState, getUserChipSx } from 'src/layouts/user';
import { useTranslate } from 'src/locales/use-locales';

import {
  MATCH_RANK_COLORS,
  formatResultAvatarUrl,
  type ResultParticipant,
} from '../match-types';

// ----------------------------------------------------------------------

type MatchResultLeaderboardProps = {
  participants: ResultParticipant[];
};

export function MatchResultLeaderboard({ participants }: MatchResultLeaderboardProps) {
  const { t } = useTranslate();
  const tokens = getDefaultGlassTokens();

  if (!participants.length) {
    return (
      <UserEmptyState
        icon="solar:trophy-bold-duotone"
        title={t('match.noResultsYet')}
        description={t('match.noResultsDescription')}
        sx={{ py: 4, border: 'none', bgcolor: 'transparent' }}
      />
    );
  }

  return (
    <Stack spacing={1}>
      {participants.map((participant, index) => {
        const isWinner = participant.status === 'winner';
        const rank = participant.placement ?? index + 1;
        const rankColor = MATCH_RANK_COLORS[rank];

        return (
          <Box
            key={participant.id}
            sx={getGlassInnerSx(tokens, {
              p: { xs: 1.5, sm: 2 },
              borderColor: isWinner ? alpha(USER_COLORS.success, 0.2) : undefined,
              bgcolor: isWinner ? alpha(USER_COLORS.success, 0.06) : undefined,
            })}
          >
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              alignItems={{ xs: 'stretch', md: 'center' }}
              spacing={{ xs: 1.5, md: 2 }}
            >
              {/* Rank + Player */}
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flex: { md: '1 1 28%' }, minWidth: 0 }}>
                <Box sx={{ width: 40, textAlign: 'center', flexShrink: 0 }}>
                  {rankColor ? (
                    <Stack alignItems="center" spacing={0.25}>
                      <Iconify icon="solar:trophy-bold" width={16} sx={{ color: rankColor }} />
                      <Typography sx={{ fontSize: 14, fontWeight: 800, color: rankColor }}>{rank}</Typography>
                    </Stack>
                  ) : (
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: USER_COLORS.textMuted }}>{rank}</Typography>
                  )}
                </Box>

                <Avatar
                  src={formatResultAvatarUrl(participant.avatar)}
                  alt={participant.username}
                  sx={{ width: 36, height: 36, flexShrink: 0 }}
                />

                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: USER_COLORS.textPrimary, lineHeight: 1.2 }}>
                    {participant.username}
                  </Typography>
                  {participant.email ? (
                    <Typography sx={{ fontSize: 11, color: USER_COLORS.textMuted, mt: 0.25 }} noWrap>
                      {participant.email}
                    </Typography>
                  ) : null}
                </Box>
              </Stack>

              {/* Stats grid */}
              <Box
                sx={{
                  flex: 1,
                  display: 'grid',
                  gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
                  gap: 1,
                }}
              >
                {[
                  { label: t('match.entry'), value: <CoinValue value={participant.entryFee} size={13} /> },
                  { label: t('match.kills'), value: participant.kills },
                  { label: t('match.points'), value: participant.points, color: USER_COLORS.info },
                  {
                    label: t('match.prize'),
                    value: participant.winPrize > 0 ? <CoinValue value={participant.winPrize} size={13} /> : '—',
                  },
                ].map((stat) => (
                  <Box key={stat.label} sx={{ textAlign: { xs: 'left', md: 'center' } }}>
                    <Typography sx={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.7, color: USER_COLORS.textMuted, textTransform: 'uppercase' }}>
                      {stat.label}
                    </Typography>
                    <Box sx={{ mt: 0.35, fontSize: 13, fontWeight: 700, color: stat.color ?? USER_COLORS.textPrimary }}>
                      {stat.value}
                    </Box>
                  </Box>
                ))}
              </Box>

              {/* Status */}
              <Box sx={{ flexShrink: 0, alignSelf: { xs: 'flex-start', md: 'center' } }}>
                <Chip
                  size="small"
                  label={isWinner ? 'Winner' : 'Lose'}
                  sx={{
                    ...getUserChipSx(isWinner ? 'success' : 'error'),
                    height: 24,
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: 0.6,
                    textTransform: 'uppercase',
                  }}
                />
              </Box>
            </Stack>
          </Box>
        );
      })}
    </Stack>
  );
}
