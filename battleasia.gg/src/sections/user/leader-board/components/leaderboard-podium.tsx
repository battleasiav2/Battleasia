import { Box, Chip, Stack, Avatar, Typography } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';

import type { ILeaderboardEntry } from 'src/types';
import { CONFIG } from 'src/global-config';
import { getAvatarUrl } from 'src/utils/get-image-url';

import { Iconify } from 'src/components/iconify';

import { USER_COLORS, getUserChipSx, userMutedTextSx } from 'src/layouts/user';

import { LEADERBOARD_PODIUM_ORDER, LEADERBOARD_PODIUM_COLORS } from '../leader-board-constants';

// ----------------------------------------------------------------------

const crownPulse = keyframes`
  0%, 100% { transform: translateY(0) scale(1); filter: drop-shadow(0 0 4px ${alpha('#f5c518', 0.45)}); }
  50% { transform: translateY(-1px) scale(1.04); filter: drop-shadow(0 0 8px ${alpha('#f5c518', 0.8)}); }
`;

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
  const podiumMap = new Map(players.map((player) => [player.rank, player]));

  if (!players.length) return null;

  return (
    <Box
      sx={{
        position: 'relative',
        px: { xs: 0, md: 0.25 },
        py: { xs: 0.35, md: 0.75 },
        borderRadius: '10px',
        overflow: 'hidden',
        bgcolor: alpha('#030509', 0.72),
        border: `1px solid ${alpha('#f5c518', 0.12)}`,
        boxShadow: `inset 0 0 32px ${alpha('#f5c518', 0.03)}, 0 12px 32px ${alpha('#000000', 0.45)}`,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'grid',
          // Always 3-up so mobile also shows #2 #1 #3 in one row
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: { xs: 0.5, sm: 0.75, md: 1.25 },
          alignItems: 'end',
        }}
      >
        {LEADERBOARD_PODIUM_ORDER.map((rank) => {
          const player = podiumMap.get(rank);
          if (!player) {
            return <Box key={rank} />;
          }

          const rankColor =
            LEADERBOARD_PODIUM_COLORS[rank as keyof typeof LEADERBOARD_PODIUM_COLORS] || '#f5c518';
          const isChamp = rank === 1;
          const avatarSrc = getAvatarUrl(player.avatar);

          return (
            <Box
              key={player.id}
              sx={{
                position: 'relative',
                minWidth: 0,
                transform: {
                  xs: isChamp ? 'translateY(-4px)' : 'none',
                  md: isChamp ? 'translateY(-6px) scale(1.02)' : 'translateY(0) scale(0.97)',
                },
                zIndex: isChamp ? 3 : 1,
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  p: { xs: 0.65, sm: 0.9, md: isChamp ? 1.35 : 1.1 },
                  minHeight: { xs: 'auto', md: isChamp ? 168 : 148 },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  textAlign: 'center',
                  overflow: 'hidden',
                  borderRadius: { xs: '8px', md: '10px' },
                  bgcolor: isChamp ? alpha('#0c1008', 0.92) : alpha('#080b10', 0.88),
                  border: isChamp
                    ? `1.5px solid ${alpha(rankColor, 0.8)}`
                    : `1px solid ${alpha(rankColor, 0.26)}`,
                  boxShadow: isChamp
                    ? `0 8px 20px ${alpha('#000000', 0.55)}, 0 0 16px ${alpha(rankColor, 0.22)}`
                    : `0 6px 14px ${alpha('#000000', 0.4)}`,
                  opacity: isChamp ? 1 : 0.92,
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: { xs: 4, md: 6 },
                    left: { xs: 4, md: 6 },
                    width: { xs: 7, md: isChamp ? 11 : 8 },
                    height: { xs: 7, md: isChamp ? 11 : 8 },
                    borderTop: `1.5px solid ${alpha(rankColor, isChamp ? 0.85 : 0.4)}`,
                    borderLeft: `1.5px solid ${alpha(rankColor, isChamp ? 0.85 : 0.4)}`,
                    pointerEvents: 'none',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: { xs: 4, md: 6 },
                    right: { xs: 4, md: 6 },
                    width: { xs: 7, md: isChamp ? 11 : 8 },
                    height: { xs: 7, md: isChamp ? 11 : 8 },
                    borderTop: `1.5px solid ${alpha(rankColor, isChamp ? 0.85 : 0.4)}`,
                    borderRight: `1.5px solid ${alpha(rankColor, isChamp ? 0.85 : 0.4)}`,
                    pointerEvents: 'none',
                  }}
                />

                <Box sx={{ mb: { xs: 0.35, md: 0.55 }, position: 'relative', zIndex: 1 }}>
                  <Iconify
                    icon={isChamp ? 'solar:crown-bold' : 'solar:medal-ribbons-star-bold'}
                    width={isChamp ? 20 : 14}
                    sx={{
                      width: {
                        xs: isChamp ? 16 : 12,
                        sm: isChamp ? 20 : 14,
                        md: isChamp ? 24 : 16,
                      },
                      height: {
                        xs: isChamp ? 16 : 12,
                        sm: isChamp ? 20 : 14,
                        md: isChamp ? 24 : 16,
                      },
                      color: rankColor,
                      filter: `drop-shadow(0 0 ${isChamp ? 6 : 3}px ${alpha(rankColor, 0.55)})`,
                      animation: isChamp ? `${crownPulse} 2.4s ease-in-out infinite` : 'none',
                      '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
                    }}
                  />
                </Box>

                <Avatar
                  src={avatarSrc}
                  sx={{
                    width: { xs: isChamp ? 34 : 28, sm: isChamp ? 42 : 34, md: isChamp ? 52 : 40 },
                    height: { xs: isChamp ? 34 : 28, sm: isChamp ? 42 : 34, md: isChamp ? 52 : 40 },
                    mb: { xs: 0.35, md: 0.55 },
                    border: `${isChamp ? 2 : 1.5}px solid ${rankColor}`,
                    boxShadow: isChamp
                      ? `0 0 0 2px ${alpha(rankColor, 0.16)}, 0 0 12px ${alpha(rankColor, 0.4)}`
                      : `0 0 8px ${alpha(rankColor, 0.25)}`,
                    bgcolor: alpha('#000000', 0.55),
                    fontWeight: 800,
                    fontSize: { xs: 12, md: isChamp ? 18 : 14 },
                  }}
                >
                  {player.username.charAt(0).toUpperCase()}
                </Avatar>

                <Typography
                  sx={{
                    fontSize: { xs: 8, sm: 9, md: isChamp ? 10 : 9 },
                    fontWeight: 900,
                    color: rankColor,
                    letterSpacing: { xs: 0.4, md: 1 },
                    mb: 0.15,
                    lineHeight: 1.1,
                  }}
                >
                  #{rank}
                  {isChamp ? (
                    <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                      {' '}
                      CHAMPION
                    </Box>
                  ) : null}
                </Typography>

                <Typography
                  className="font-tr"
                  sx={{
                    fontSize: { xs: 10, sm: 11, md: isChamp ? 14 : 12 },
                    fontWeight: 800,
                    color: USER_COLORS.textPrimary,
                    textTransform: 'uppercase',
                    mb: { xs: 0.25, md: 0.4 },
                    maxWidth: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.15,
                    px: 0.25,
                  }}
                >
                  {player.username}
                </Typography>

                <Chip
                  label={player.badge}
                  size="small"
                  sx={{
                    mb: { xs: 0.35, md: 0.55 },
                    height: { xs: 14, md: 18 },
                    fontSize: { xs: 7, md: 9 },
                    letterSpacing: 0.2,
                    '& .MuiChip-label': { px: { xs: 0.5, md: 0.75 } },
                    display: { xs: 'none', sm: 'inline-flex' },
                    ...getUserChipSx(isChamp ? 'gold' : 'success'),
                  }}
                />

                <Stack
                  direction="row"
                  spacing={0.35}
                  alignItems="center"
                  justifyContent="center"
                  sx={{ mb: 0.15, maxWidth: 1, minWidth: 0 }}
                >
                  <Box
                    component="img"
                    src={CONFIG.currencyIcon}
                    alt=""
                    sx={{
                      width: { xs: 10, md: isChamp ? 13 : 11 },
                      height: { xs: 10, md: isChamp ? 13 : 11 },
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: { xs: 9, sm: 10, md: isChamp ? 12 : 11 },
                      fontWeight: 800,
                      color: USER_COLORS.textPrimary,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      lineHeight: 1.2,
                    }}
                  >
                    {formatScore(player.totalScore)}
                    <Box
                      component="span"
                      sx={{
                        color: alpha('#ffffff', 0.55),
                        fontWeight: 700,
                        fontSize: '0.85em',
                        display: { xs: 'none', sm: 'inline' },
                      }}
                    >
                      {' '}
                      {pointsLabel}
                    </Box>
                  </Typography>
                </Stack>

                <Typography
                  sx={{
                    ...userMutedTextSx,
                    fontSize: { xs: 7.5, sm: 8.5, md: 10 },
                    fontWeight: 600,
                    lineHeight: 1.2,
                    px: 0.25,
                    maxWidth: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>
                    {player.gamesPlayed.toLocaleString()} {gamesLabel} · {averageLabel}:{' '}
                    {player.averageScore.toFixed(1)}%
                  </Box>
                  <Box component="span" sx={{ display: { xs: 'inline', md: 'none' } }}>
                    {player.gamesPlayed}G · {player.averageScore.toFixed(0)}%
                  </Box>
                </Typography>

                <Box
                  sx={{
                    mt: { xs: 0.5, md: 0.85 },
                    width: isChamp ? '55%' : '42%',
                    height: { xs: 2, md: isChamp ? 3 : 2 },
                    borderRadius: 1,
                    background: `linear-gradient(90deg, transparent, ${rankColor}, transparent)`,
                    boxShadow: isChamp ? `0 0 8px ${alpha(rankColor, 0.45)}` : 'none',
                  }}
                />
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
