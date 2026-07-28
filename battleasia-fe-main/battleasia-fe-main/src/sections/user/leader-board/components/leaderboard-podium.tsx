import { Box, Stack, Avatar, Typography, Chip } from '@mui/material';
import { alpha } from '@mui/material/styles';

import type { ILeaderboardEntry } from 'src/types';
import { CONFIG } from 'src/global-config';
import { getAvatarUrl } from 'src/utils/get-image-url';

import { Iconify } from 'src/components/iconify';
import { getDefaultGlassTokens, getGlassShellSx } from 'src/components/battle-glass-card';

import { USER_COLORS, userMutedTextSx, getUserChipSx } from 'src/layouts/user';

import { LEADERBOARD_PODIUM_COLORS, LEADERBOARD_PODIUM_ORDER } from '../leader-board-constants';

// ----------------------------------------------------------------------

type LeaderboardPodiumProps = {
  players: ILeaderboardEntry[];
  pointsLabel: string;
  gamesLabel: string;
  averageLabel: string;
  formatScore: (score: number) => string;
};

export function LeaderboardPodium({
  players,
  pointsLabel,
  gamesLabel,
  averageLabel,
  formatScore,
}: LeaderboardPodiumProps) {
  const tokens = getDefaultGlassTokens();
  const podiumMap = new Map(players.map((player) => [player.rank, player]));

  if (!players.length) return null;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
        gap: 1.5,
        alignItems: 'end',
      }}
    >
      {LEADERBOARD_PODIUM_ORDER.map((rank) => {
        const player = podiumMap.get(rank);
        if (!player) {
          return <Box key={rank} sx={{ display: { xs: 'none', md: 'block' } }} />;
        }

        const rankColor = LEADERBOARD_PODIUM_COLORS[rank as keyof typeof LEADERBOARD_PODIUM_COLORS];
        const height = rank === 1 ? 220 : rank === 2 ? 190 : 170;
        const avatarSrc = getAvatarUrl(player.avatar);

        return (
          <Box
            key={player.id}
            sx={getGlassShellSx(tokens, {
              p: 2,
              textAlign: 'center',
              minHeight: { xs: 'auto', md: height },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-end',
              borderColor: alpha(rankColor, 0.4),
              boxShadow: `0 12px 32px ${alpha('#000000', 0.5)}, 0 0 24px ${alpha(rankColor, 0.12)}`,
            })}
          >
            <Iconify icon="solar:trophy-bold" width={rank === 1 ? 28 : 22} sx={{ color: rankColor, mb: 1 }} />

            <Avatar
              src={avatarSrc}
              sx={{
                width: rank === 1 ? 64 : 52,
                height: rank === 1 ? 64 : 52,
                mb: 1,
                border: `2px solid ${rankColor}`,
                bgcolor: alpha('#000000', 0.35),
                fontWeight: 700,
              }}
            >
              {player.username.charAt(0).toUpperCase()}
            </Avatar>

            <Typography sx={{ fontSize: 11, fontWeight: 800, color: rankColor, letterSpacing: 0.8, mb: 0.5 }}>
              #{rank}
            </Typography>

            <Typography
              className="font-tr"
              sx={{
                fontSize: rank === 1 ? 16 : 14,
                fontWeight: 800,
                color: USER_COLORS.textPrimary,
                textTransform: 'uppercase',
                mb: 0.5,
                maxWidth: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {player.username}
            </Typography>

            <Chip
              label={player.badge}
              size="small"
              sx={{
                mb: 1,
                height: 22,
                fontSize: 10,
                ...getUserChipSx('gold'),
              }}
            />

            <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" flexWrap="wrap">
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Box component="img" src={CONFIG.currencyIcon} alt="Coin" sx={{ width: 14, height: 14 }} />
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: USER_COLORS.textPrimary }}>
                  {formatScore(player.totalScore)} {pointsLabel}
                </Typography>
              </Stack>
            </Stack>

            <Typography sx={{ ...userMutedTextSx, fontSize: 11, mt: 0.75 }}>
              {player.gamesPlayed.toLocaleString()} {gamesLabel} · {averageLabel}: {player.averageScore.toFixed(1)}%
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
