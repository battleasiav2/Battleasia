import { Box, Stack, Avatar, Typography } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';

import type { ILeaderboardEntry } from 'src/types';
import { CONFIG } from 'src/global-config';
import { getAvatarUrl } from 'src/utils/get-image-url';

import { goldAlpha, USER_COLORS } from 'src/layouts/user';

// ----------------------------------------------------------------------

const GOLD = USER_COLORS.gold;

const rowIn = keyframes`
  from { opacity: 0; transform: translateX(-8px); }
  to { opacity: 1; transform: translateX(0); }
`;

type LeaderboardTableProps = {
  rows: ILeaderboardEntry[];
  labels: {
    games: string;
    average: string;
    level: string;
  };
  formatScore: (score: number) => string;
  /** Highest score on the board — used for relative strength bars */
  maxScore?: number;
};

export function LeaderboardTable({
  rows,
  labels,
  formatScore,
  maxScore = 0,
}: LeaderboardTableProps) {
  const peak = Math.max(maxScore, ...rows.map((r) => r.totalScore), 1);

  return (
    <>
      {rows.map((player, index) => {
        const avatarSrc = getAvatarUrl(player.avatar);
        const isLast = index === rows.length - 1;
        const strength = Math.min(100, Math.round((player.totalScore / peak) * 100));
        const meta = [
          `${labels.level} ${player.level}`,
          `${player.gamesPlayed.toLocaleString()} ${labels.games}`,
          `${labels.average} ${player.averageScore.toFixed(1)}%`,
          player.badge,
        ]
          .filter(Boolean)
          .join(' · ');

        return (
          <Box
            key={player.id}
            sx={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 1.25, sm: 1.75 },
              width: 1,
              px: { xs: 1.5, sm: 2 },
              py: { xs: 1.35, sm: 1.6 },
              borderBottom: isLast ? 'none' : `1px solid ${alpha('#ffffff', 0.08)}`,
              animation: `${rowIn} 0.35s ease-out ${Math.min(index, 12) * 0.04}s both`,
              transition: 'background-color 0.2s ease',
              '&::before': {
                content: '""',
                position: 'absolute',
                left: 0,
                top: 8,
                bottom: 8,
                width: 2,
                bgcolor: 'transparent',
                transition: 'background-color 0.2s ease',
              },
              '&:hover': {
                bgcolor: goldAlpha(0.06),
                '&::before': { bgcolor: GOLD },
                '& .lb-title': { color: GOLD },
                '& .lb-bar': { opacity: 1 },
              },
            }}
          >
            <Typography
              sx={{
                width: 40,
                flexShrink: 0,
                fontSize: 14,
                fontWeight: 900,
                textAlign: 'center',
                fontVariantNumeric: 'tabular-nums',
                color: alpha('#ffffff', 0.45),
              }}
            >
              {player.rank}
            </Typography>

            <Avatar
              src={avatarSrc}
              sx={{
                width: { xs: 40, sm: 44 },
                height: { xs: 40, sm: 44 },
                flexShrink: 0,
                bgcolor: '#0a0a0a',
                border: `1px solid ${alpha('#ffffff', 0.12)}`,
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {player.username.charAt(0).toUpperCase()}
            </Avatar>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                className="lb-title font-tr"
                sx={{
                  fontSize: { xs: 13, sm: 15 },
                  fontWeight: 800,
                  color: USER_COLORS.textPrimary,
                  textTransform: 'uppercase',
                  lineHeight: 1.2,
                  transition: 'color 0.2s ease',
                }}
                noWrap
              >
                {player.username}
              </Typography>

              <Typography
                sx={{
                  mt: 0.4,
                  fontSize: { xs: 11, sm: 12 },
                  color: alpha('#ffffff', 0.48),
                  lineHeight: 1.35,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {meta}
              </Typography>

              {/* Relative power bar */}
              <Box
                className="lb-bar"
                sx={{
                  mt: 0.85,
                  height: 3,
                  width: 1,
                  maxWidth: 220,
                  bgcolor: alpha('#ffffff', 0.06),
                  overflow: 'hidden',
                  opacity: 0.85,
                }}
              >
                <Box
                  sx={{
                    height: 1,
                    width: `${strength}%`,
                    background: `linear-gradient(90deg, ${goldAlpha(0.35)}, ${GOLD})`,
                    transition: 'width 0.6s ease',
                  }}
                />
              </Box>
            </Box>

            <Stack alignItems="flex-end" spacing={0.25} sx={{ flexShrink: 0 }}>
              <Stack direction="row" alignItems="center" spacing={0.45}>
                <Box
                  component="img"
                  src={CONFIG.currencyIcon}
                  alt=""
                  sx={{ width: 14, height: 14, display: { xs: 'none', sm: 'block' } }}
                />
                <Typography
                  sx={{
                    fontSize: { xs: 13, sm: 14 },
                    fontWeight: 800,
                    color: USER_COLORS.textPrimary,
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
                  letterSpacing: 0.5,
                  color: alpha('#ffffff', 0.35),
                  textTransform: 'uppercase',
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                {strength}% power
              </Typography>
            </Stack>
          </Box>
        );
      })}
    </>
  );
}
