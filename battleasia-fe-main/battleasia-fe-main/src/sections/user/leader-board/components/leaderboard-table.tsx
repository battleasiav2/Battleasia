import { Box, Stack, Avatar, Typography, Chip } from '@mui/material';
import { alpha } from '@mui/material/styles';

import type { ILeaderboardEntry } from 'src/types';
import { CONFIG } from 'src/global-config';
import { getAvatarUrl } from 'src/utils/get-image-url';

import { getDefaultGlassTokens, getGlassInnerSx } from 'src/components/battle-glass-card';

import { USER_COLORS, userMutedTextSx, getUserChipSx } from 'src/layouts/user';

// ----------------------------------------------------------------------

type LeaderboardTableProps = {
  rows: ILeaderboardEntry[];
  labels: {
    rank: string;
    player: string;
    totalScore: string;
    games: string;
    average: string;
    badge: string;
    lastPlayed: string;
    level: string;
  };
  formatScore: (score: number) => string;
  getRankIcon: (rank: number) => string;
};

export function LeaderboardTable({ rows, labels, formatScore, getRankIcon }: LeaderboardTableProps) {
  const tokens = getDefaultGlassTokens();

  return (
    <Stack spacing={1}>
      <Box
        sx={{
          display: { xs: 'none', md: 'grid' },
          gridTemplateColumns: '72px 1.4fr 1fr 0.8fr 0.8fr 0.9fr 1fr',
          gap: 1,
          px: 2,
          py: 1,
        }}
      >
        {[labels.rank, labels.player, labels.totalScore, labels.games, labels.average, labels.badge, labels.lastPlayed].map(
          (label) => (
            <Typography
              key={label}
              sx={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: 0.8,
                textTransform: 'uppercase',
                color: USER_COLORS.textMuted,
              }}
            >
              {label}
            </Typography>
          )
        )}
      </Box>

      {rows.map((player) => {
        const avatarSrc = getAvatarUrl(player.avatar);
        const isTopRank = player.rank <= 3;

        return (
          <Box
            key={player.id}
            sx={getGlassInnerSx(tokens, {
              p: { xs: 1.5, md: 2 },
              display: 'grid',
              gridTemplateColumns: {
                xs: '48px 1fr auto',
                md: '72px 1.4fr 1fr 0.8fr 0.8fr 0.9fr 1fr',
              },
              gap: { xs: 1, md: 1 },
              alignItems: 'center',
              borderColor: isTopRank ? alpha(USER_COLORS.gold, 0.2) : undefined,
            })}
          >
            <Typography sx={{ fontSize: 16, fontWeight: 800, color: isTopRank ? USER_COLORS.gold : USER_COLORS.textMuted, textAlign: 'center' }}>
              {isTopRank ? getRankIcon(player.rank) : `#${player.rank}`}
            </Typography>

            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
              <Avatar
                src={avatarSrc}
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: alpha(USER_COLORS.gold, 0.12),
                  border: `1px solid ${alpha(USER_COLORS.gold, 0.3)}`,
                  fontWeight: 700,
                }}
              >
                {player.username.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: USER_COLORS.textPrimary }} noWrap>
                  {player.username}
                </Typography>
                <Typography sx={{ ...userMutedTextSx, fontSize: 11 }}>
                  {labels.level} {player.level}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={0.5} alignItems="center" justifyContent={{ xs: 'flex-end', md: 'flex-start' }}>
              <Box component="img" src={CONFIG.currencyIcon} alt="Coin" sx={{ width: 14, height: 14 }} />
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: USER_COLORS.textPrimary }}>
                {formatScore(player.totalScore)}
              </Typography>
            </Stack>

            <Typography sx={{ fontSize: 13, color: USER_COLORS.textSubtle, display: { xs: 'none', md: 'block' } }}>
              {player.gamesPlayed.toLocaleString()}
            </Typography>

            <Typography sx={{ fontSize: 13, color: USER_COLORS.textSubtle, display: { xs: 'none', md: 'block' } }}>
              {player.averageScore.toFixed(1)}%
            </Typography>

            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <Chip
                label={player.badge}
                size="small"
                sx={getUserChipSx('gold')}
              />
            </Box>

            <Typography sx={{ ...userMutedTextSx, fontSize: 12, display: { xs: 'none', md: 'block' }, color: USER_COLORS.textSubtle }}>
              {player.lastPlayed || '—'}
            </Typography>
          </Box>
        );
      })}
    </Stack>
  );
}
