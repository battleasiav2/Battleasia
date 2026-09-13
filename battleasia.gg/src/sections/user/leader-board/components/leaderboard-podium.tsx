import { Box, Stack, Avatar, Typography } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';

import type { ILeaderboardEntry } from 'src/types';
import { CONFIG } from 'src/global-config';
import { getAvatarUrl } from 'src/utils/get-image-url';
import { Iconify } from 'src/components/iconify';

import { USER_COLORS, goldAlpha } from 'src/layouts/user';

import { LEADERBOARD_PODIUM_ORDER, LEADERBOARD_PODIUM_COLORS } from '../leader-board-constants';

// ----------------------------------------------------------------------

const crownFloat = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
`;

const champPulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 ${goldAlpha(0.45)}, 0 0 28px ${goldAlpha(0.2)}; }
  50% { box-shadow: 0 0 0 8px ${goldAlpha(0)}, 0 0 36px ${goldAlpha(0.35)}; }
`;

const riseIn = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pedestalHeights = { 1: { xs: 72, sm: 96 }, 2: { xs: 48, sm: 64 }, 3: { xs: 36, sm: 48 } } as const;
const avatarSizes = { 1: { xs: 64, sm: 80 }, 2: { xs: 48, sm: 56 }, 3: { xs: 44, sm: 52 } } as const;

type LeaderboardPodiumProps = {
  players: ILeaderboardEntry[];
  pointsLabel: string;
  formatScore: (score: number) => string;
};

/** Stadium podium — height tiers, crown on #1, CSS-only motion. */
export function LeaderboardPodium({ players, pointsLabel, formatScore }: LeaderboardPodiumProps) {
  const podiumMap = new Map(players.map((player) => [player.rank, player]));

  if (!players.length) return null;

  return (
    <Box
      sx={{
        position: 'relative',
        width: 1,
        overflow: 'hidden',
        bgcolor: 'transparent',
        border: 'none',
        borderTop: 'none',
        clipPath: 'none',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 60% 50% at 50% 12%, ${goldAlpha(0.18)} 0%, transparent 72%),
            linear-gradient(180deg, ${alpha('#152032', 0.35)} 0%, transparent 55%)
          `,
          pointerEvents: 'none',
        },
      }}
    >
      <Stack
        direction="row"
        alignItems="flex-end"
        justifyContent="center"
        spacing={{ xs: 1, sm: 2 }}
        sx={{
          position: 'relative',
          zIndex: 1,
          px: { xs: 1.25, sm: 3 },
          pt: { xs: 2.5, sm: 3.5 },
          pb: 0,
          minHeight: { xs: 240, sm: 300 },
        }}
      >
        {LEADERBOARD_PODIUM_ORDER.map((rank, index) => {
          const player = podiumMap.get(rank);
          const rankColor =
            LEADERBOARD_PODIUM_COLORS[rank as keyof typeof LEADERBOARD_PODIUM_COLORS] ||
            USER_COLORS.gold;
          const isChamp = rank === 1;
          const avatarSize = avatarSizes[rank as 1 | 2 | 3];
          const pedestalH = pedestalHeights[rank as 1 | 2 | 3];

          return (
            <Box
              key={rank}
              sx={{
                flex: isChamp ? 1.15 : 1,
                maxWidth: isChamp ? 200 : 160,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                animation: `${riseIn} 0.55s ease-out ${index * 0.08}s both`,
              }}
            >
              {player ? (
                <Stack alignItems="center" spacing={0.75} sx={{ width: 1, mb: 1.25 }}>
                  {isChamp ? (
                    <Iconify
                      icon="solar:crown-bold"
                      width={22}
                      sx={{
                        color: USER_COLORS.gold,
                        animation: `${crownFloat} 2.4s ease-in-out infinite`,
                        filter: `drop-shadow(0 0 8px ${goldAlpha(0.55)})`,
                      }}
                    />
                  ) : (
                    <Box sx={{ height: 22 }} />
                  )}

                  <Box sx={{ position: 'relative' }}>
                    <Avatar
                      src={getAvatarUrl(player.avatar)}
                      sx={{
                        width: avatarSize,
                        height: avatarSize,
                        bgcolor: '#0a0a0a',
                        border: `2px solid ${rankColor}`,
                        fontWeight: 800,
                        fontSize: isChamp ? 22 : 16,
                        animation: isChamp ? `${champPulse} 2.8s ease-in-out infinite` : 'none',
                      }}
                    >
                      {player.username.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: -4,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        px: 0.75,
                        py: 0.15,
                        bgcolor: '#06090e',
                        border: `1px solid ${alpha(rankColor, 0.7)}`,
                        fontSize: 10,
                        fontWeight: 900,
                        letterSpacing: 0.6,
                        color: rankColor,
                        lineHeight: 1.4,
                      }}
                    >
                      #{rank}
                    </Box>
                  </Box>

                  <Typography
                    className="font-tr"
                    sx={{
                      mt: 0.75,
                      fontSize: { xs: isChamp ? 13 : 11, sm: isChamp ? 16 : 13 },
                      fontWeight: 900,
                      color: USER_COLORS.textPrimary,
                      textTransform: 'uppercase',
                      textAlign: 'center',
                      maxWidth: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      px: 0.5,
                    }}
                  >
                    {player.username}
                  </Typography>

                  <Stack direction="row" alignItems="center" spacing={0.45}>
                    <Box
                      component="img"
                      src={CONFIG.currencyIcon}
                      alt=""
                      sx={{ width: isChamp ? 14 : 12, height: isChamp ? 14 : 12 }}
                    />
                    <Typography
                      sx={{
                        fontSize: { xs: isChamp ? 14 : 12, sm: isChamp ? 18 : 13 },
                        fontWeight: 800,
                        color: isChamp ? USER_COLORS.gold : USER_COLORS.textPrimary,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {formatScore(player.totalScore)}
                    </Typography>
                  </Stack>

                  <Typography
                    sx={{
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: 0.7,
                      color: alpha('#ffffff', 0.4),
                      textTransform: 'uppercase',
                      display: { xs: 'none', sm: 'block' },
                    }}
                  >
                    {pointsLabel}
                  </Typography>
                </Stack>
              ) : (
                <Box sx={{ height: { xs: 120, sm: 140 } }} />
              )}

              {/* Pedestal */}
              <Box
                sx={{
                  width: 1,
                  height: pedestalH,
                  position: 'relative',
                  background: `linear-gradient(180deg, ${alpha(rankColor, 0.28)} 0%, ${alpha(rankColor, 0.06)} 100%)`,
                  borderTop: `2px solid ${rankColor}`,
                  borderLeft: `1px solid ${alpha(rankColor, 0.35)}`,
                  borderRight: `1px solid ${alpha(rankColor, 0.35)}`,
                  clipPath: 'polygon(8% 0, 92% 0, 100% 100%, 0 100%)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  pt: 1,
                  '&::after': isChamp
                    ? {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        background: `linear-gradient(180deg, ${goldAlpha(0.12)} 0%, transparent 60%)`,
                        pointerEvents: 'none',
                      }
                    : undefined,
                }}
              >
                <Typography
                  sx={{
                    fontSize: { xs: 18, sm: isChamp ? 28 : 20 },
                    fontWeight: 900,
                    color: alpha(rankColor, 0.55),
                    letterSpacing: -1,
                    lineHeight: 1,
                  }}
                >
                  {rank}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}
