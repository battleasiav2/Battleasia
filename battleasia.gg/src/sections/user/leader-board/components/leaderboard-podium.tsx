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
  0%, 100% { transform: translateY(0) scale(1); filter: drop-shadow(0 0 8px ${alpha('#f5c518', 0.55)}); }
  50% { transform: translateY(-3px) scale(1.06); filter: drop-shadow(0 0 16px ${alpha('#f5c518', 0.9)}); }
`;

const champAura = keyframes`
  0%, 100% { opacity: 0.55; transform: scale(1); }
  50% { opacity: 0.9; transform: scale(1.08); }
`;

const borderScan = keyframes`
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
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
        px: { xs: 0, md: 1 },
        py: { xs: 1, md: 2.5 },
        borderRadius: '14px',
        overflow: 'hidden',
        bgcolor: alpha('#030509', 0.72),
        border: `1px solid ${alpha('#f5c518', 0.14)}`,
        boxShadow: `inset 0 0 60px ${alpha('#f5c518', 0.04)}, 0 24px 60px ${alpha('#000000', 0.55)}`,
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `
            radial-gradient(ellipse 45% 55% at 50% 42%, ${alpha('#f5c518', 0.16)} 0%, transparent 70%),
            radial-gradient(ellipse 30% 40% at 18% 70%, ${alpha('#c0c0c0', 0.05)} 0%, transparent 70%),
            radial-gradient(ellipse 30% 40% at 82% 70%, ${alpha('#cd7f32', 0.06)} 0%, transparent 70%)
          `,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.35,
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent 0px,
            transparent 3px,
            ${alpha('#ffffff', 0.012)} 3px,
            ${alpha('#ffffff', 0.012)} 4px
          )`,
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
          gap: { xs: 1.75, md: 2 },
          alignItems: 'end',
        }}
      >
        {LEADERBOARD_PODIUM_ORDER.map((rank) => {
          const player = podiumMap.get(rank);
          if (!player) {
            return <Box key={rank} sx={{ display: { xs: 'none', md: 'block' } }} />;
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
                order: { xs: isChamp ? 0 : rank === 2 ? 1 : 2, md: 'unset' },
                transform: {
                  xs: 'none',
                  md: isChamp ? 'translateY(-18px) scale(1.06)' : 'translateY(0) scale(0.96)',
                },
                zIndex: isChamp ? 3 : 1,
                transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
                '&:hover': {
                  transform: {
                    xs: 'translateY(-4px)',
                    md: isChamp ? 'translateY(-24px) scale(1.08)' : 'translateY(-8px) scale(0.98)',
                  },
                },
              }}
            >
              {/* Champion spotlight bloom */}
              {isChamp && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '8%',
                    left: '50%',
                    width: 180,
                    height: 180,
                    ml: '-90px',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${alpha(rankColor, 0.45)} 0%, transparent 70%)`,
                    filter: 'blur(18px)',
                    animation: `${champAura} 3.2s ease-in-out infinite`,
                    pointerEvents: 'none',
                    zIndex: 0,
                    '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
                  }}
                />
              )}

              <Box
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  p: { xs: 2.25, md: isChamp ? 2.75 : 2.1 },
                  minHeight: { xs: 'auto', md: isChamp ? 300 : rank === 2 ? 250 : 230 },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  textAlign: 'center',
                  overflow: 'hidden',
                  borderRadius: '12px',
                  bgcolor: isChamp ? alpha('#0c1008', 0.92) : alpha('#080b10', 0.88),
                  border: isChamp
                    ? `1.5px solid ${alpha(rankColor, 0.85)}`
                    : `1px solid ${alpha(rankColor, 0.28)}`,
                  boxShadow: isChamp
                    ? `
                      0 0 0 1px ${alpha(rankColor, 0.35)},
                      0 28px 56px ${alpha('#000000', 0.75)},
                      0 0 48px ${alpha(rankColor, 0.35)},
                      inset 0 1px 0 ${alpha('#ffffff', 0.18)},
                      inset 0 -40px 60px ${alpha(rankColor, 0.08)}
                    `
                    : `
                      0 14px 32px ${alpha('#000000', 0.55)},
                      0 0 18px ${alpha(rankColor, 0.1)},
                      inset 0 1px 0 ${alpha('#ffffff', 0.08)}
                    `,
                  opacity: isChamp ? 1 : 0.88,
                  filter: isChamp ? 'none' : 'saturate(0.85)',
                  clipPath: isChamp
                    ? 'polygon(0 10px, 10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px))'
                    : 'polygon(0 6px, 6px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0 calc(100% - 6px))',
                }}
              >
                {/* Animated gold scan line — champion only */}
                {isChamp && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: `linear-gradient(90deg, transparent, ${rankColor}, #fff8c8, ${rankColor}, transparent)`,
                      backgroundSize: '200% 100%',
                      boxShadow: `0 0 14px ${rankColor}`,
                      animation: `${borderScan} 2.8s linear infinite`,
                      '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
                    }}
                  />
                )}

                {/* HUD corner brackets */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    width: isChamp ? 16 : 12,
                    height: isChamp ? 16 : 12,
                    borderTop: `2px solid ${alpha(rankColor, isChamp ? 0.9 : 0.45)}`,
                    borderLeft: `2px solid ${alpha(rankColor, isChamp ? 0.9 : 0.45)}`,
                    pointerEvents: 'none',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: isChamp ? 16 : 12,
                    height: isChamp ? 16 : 12,
                    borderTop: `2px solid ${alpha(rankColor, isChamp ? 0.9 : 0.45)}`,
                    borderRight: `2px solid ${alpha(rankColor, isChamp ? 0.9 : 0.45)}`,
                    pointerEvents: 'none',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    left: 8,
                    width: isChamp ? 16 : 12,
                    height: isChamp ? 16 : 12,
                    borderBottom: `2px solid ${alpha(rankColor, isChamp ? 0.9 : 0.45)}`,
                    borderLeft: `2px solid ${alpha(rankColor, isChamp ? 0.9 : 0.45)}`,
                    pointerEvents: 'none',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    width: isChamp ? 16 : 12,
                    height: isChamp ? 16 : 12,
                    borderBottom: `2px solid ${alpha(rankColor, isChamp ? 0.9 : 0.45)}`,
                    borderRight: `2px solid ${alpha(rankColor, isChamp ? 0.9 : 0.45)}`,
                    pointerEvents: 'none',
                  }}
                />

                <Box sx={{ mb: 1.25, position: 'relative', zIndex: 1 }}>
                  <Iconify
                    icon={isChamp ? 'solar:crown-bold' : 'solar:trophy-bold'}
                    width={isChamp ? 40 : 26}
                    sx={{
                      color: rankColor,
                      filter: `drop-shadow(0 0 ${isChamp ? 12 : 6}px ${alpha(rankColor, 0.7)})`,
                      animation: isChamp ? `${crownPulse} 2.4s ease-in-out infinite` : 'none',
                      '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
                    }}
                  />
                </Box>

                <Box sx={{ position: 'relative', mb: 1.25 }}>
                  {isChamp && (
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: -8,
                        borderRadius: '50%',
                        background: `conic-gradient(from 0deg, ${alpha(rankColor, 0.0)}, ${alpha(rankColor, 0.7)}, ${alpha('#ffffff', 0.5)}, ${alpha(rankColor, 0.7)}, ${alpha(rankColor, 0.0)})`,
                        filter: 'blur(1px)',
                        opacity: 0.85,
                        pointerEvents: 'none',
                      }}
                    />
                  )}
                  <Avatar
                    src={avatarSrc}
                    sx={{
                      position: 'relative',
                      width: isChamp ? 84 : 56,
                      height: isChamp ? 84 : 56,
                      border: `${isChamp ? 3 : 2}px solid ${rankColor}`,
                      boxShadow: isChamp
                        ? `0 0 0 4px ${alpha(rankColor, 0.2)}, 0 0 28px ${alpha(rankColor, 0.55)}`
                        : `0 0 14px ${alpha(rankColor, 0.35)}`,
                      bgcolor: alpha('#000000', 0.55),
                      fontWeight: 800,
                      fontSize: isChamp ? 28 : 20,
                    }}
                  >
                    {player.username.charAt(0).toUpperCase()}
                  </Avatar>
                </Box>

                <Typography
                  sx={{
                    fontSize: isChamp ? 12 : 11,
                    fontWeight: 900,
                    color: rankColor,
                    letterSpacing: isChamp ? 2 : 1.2,
                    mb: 0.5,
                    textShadow: isChamp ? `0 0 16px ${alpha(rankColor, 0.65)}` : 'none',
                  }}
                >
                  #{rank}
                  {isChamp ? ' CHAMPION' : ''}
                </Typography>

                <Typography
                  className="font-tr"
                  sx={{
                    fontSize: isChamp ? 20 : 15,
                    fontWeight: 800,
                    color: USER_COLORS.textPrimary,
                    textTransform: 'uppercase',
                    mb: 0.75,
                    maxWidth: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    textShadow: isChamp ? `0 0 20px ${alpha(rankColor, 0.35)}` : 'none',
                  }}
                >
                  {player.username}
                </Typography>

                <Chip
                  label={player.badge}
                  size="small"
                  sx={{
                    mb: 1.25,
                    height: 22,
                    fontSize: 10,
                    letterSpacing: 0.4,
                    ...getUserChipSx(isChamp ? 'gold' : 'success'),
                    ...(isChamp && {
                      boxShadow: `0 0 12px ${alpha(rankColor, 0.35)}`,
                    }),
                  }}
                />

                <Stack direction="row" spacing={0.6} alignItems="center" justifyContent="center" sx={{ mb: 0.5 }}>
                  <Box
                    component="img"
                    src={CONFIG.currencyIcon}
                    alt=""
                    sx={{
                      width: isChamp ? 18 : 14,
                      height: isChamp ? 18 : 14,
                      filter: isChamp ? `drop-shadow(0 0 6px ${alpha(rankColor, 0.7)})` : 'none',
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: isChamp ? 15 : 12,
                      fontWeight: 800,
                      color: USER_COLORS.textPrimary,
                      letterSpacing: 0.2,
                    }}
                  >
                    {formatScore(player.totalScore)}{' '}
                    <Box component="span" sx={{ color: alpha('#ffffff', 0.65), fontWeight: 700, fontSize: '0.85em' }}>
                      {pointsLabel}
                    </Box>
                  </Typography>
                </Stack>

                <Typography sx={{ ...userMutedTextSx, fontSize: 11, fontWeight: 600 }}>
                  {player.gamesPlayed.toLocaleString()} {gamesLabel} · {averageLabel}:{' '}
                  {player.averageScore.toFixed(1)}%
                </Typography>

                {/* Pedestal rank bar */}
                <Box
                  sx={{
                    mt: 1.75,
                    width: isChamp ? '72%' : '55%',
                    height: isChamp ? 6 : 4,
                    borderRadius: 1,
                    background: `linear-gradient(90deg, transparent, ${rankColor}, transparent)`,
                    boxShadow: isChamp ? `0 0 14px ${alpha(rankColor, 0.7)}` : `0 0 8px ${alpha(rankColor, 0.3)}`,
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
