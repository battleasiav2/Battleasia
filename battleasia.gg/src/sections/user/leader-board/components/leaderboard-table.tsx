import { Box, Stack, Avatar, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import type { ILeaderboardEntry } from 'src/types';
import { getAvatarUrl } from 'src/utils/get-image-url';
import { Iconify } from 'src/components/iconify';

import { goldAlpha, USER_COLORS } from 'src/layouts/user';

// ----------------------------------------------------------------------

const GOLD = USER_COLORS.gold;

type LeaderboardTableProps = {
  rows: ILeaderboardEntry[];
  labels: {
    rank: string;
    player: string;
    wins: string;
    matches: string;
    games: string;
    average: string;
    level: string;
  };
};

function RankMark({ rank }: { rank: number }) {
  if (rank === 1) {
    return <Iconify icon="solar:crown-bold" width={22} sx={{ color: GOLD }} />;
  }
  if (rank === 2) {
    return <Iconify icon="solar:medal-ribbons-star-bold" width={22} sx={{ color: '#c0c0c0' }} />;
  }
  if (rank === 3) {
    return <Iconify icon="solar:medal-star-bold" width={22} sx={{ color: '#cd7f32' }} />;
  }
  return (
    <Typography
      sx={{
        fontSize: 14,
        fontWeight: 800,
        color: alpha('#ffffff', 0.45),
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {String(rank).padStart(2, '0')}
    </Typography>
  );
}

export function LeaderboardTable({ rows, labels }: LeaderboardTableProps) {
  return (
    <Box sx={{ px: { xs: 1.25, sm: 1.75 }, pb: { xs: 1.5, sm: 2 } }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '44px minmax(0, 1fr) 52px 64px',
            sm: '52px minmax(0, 1fr) 72px 88px',
          },
          gap: 1.25,
          px: 0.5,
          mb: 0,
          pb: 1,
          borderBottom: `1px solid ${alpha('#ffffff', 0.08)}`,
        }}
      >
        {[labels.rank, labels.player, labels.wins, labels.matches].map((label, i) => (
          <Typography
            key={label}
            sx={{
              fontSize: '0.62rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: alpha('#ffffff', 0.42),
              textAlign: i >= 2 ? 'right' : 'left',
            }}
          >
            {label}
          </Typography>
        ))}
      </Box>

      <Stack spacing={0}>
        {rows.map((player) => {
          const avatarSrc = getAvatarUrl(player.avatar);
          const meta = [`${labels.level} ${player.level}`, player.badge].filter(Boolean).join(' · ');
          const wins = player.wins ?? 0;

          return (
            <Box
              key={player.id}
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '44px minmax(0, 1fr) 52px 64px',
                  sm: '52px minmax(0, 1fr) 72px 88px',
                },
                gap: 1.25,
                alignItems: 'center',
                px: 0.5,
                py: { xs: 1.2, sm: 1.35 },
                borderBottom: `1px solid ${alpha('#ffffff', 0.08)}`,
                bgcolor: 'transparent',
                transition: 'background-color 0.2s ease',
                '&:hover': {
                  bgcolor: goldAlpha(0.04),
                },
              }}
            >
              <Box sx={{ display: 'grid', placeItems: 'center' }}>
                <RankMark rank={player.rank} />
              </Box>

              <Stack direction="row" spacing={1.35} alignItems="center" sx={{ minWidth: 0 }}>
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
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: { xs: 13, sm: 15 },
                      fontWeight: 800,
                      color: USER_COLORS.textPrimary,
                      lineHeight: 1.2,
                    }}
                    noWrap
                  >
                    {player.username}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.35,
                      fontSize: { xs: 11, sm: 12 },
                      color: alpha('#ffffff', 0.48),
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {meta}
                  </Typography>
                </Box>
              </Stack>

              <Typography
                sx={{
                  textAlign: 'right',
                  fontSize: { xs: 13, sm: 15 },
                  fontWeight: 700,
                  color: USER_COLORS.textPrimary,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {wins}
              </Typography>
              <Typography
                sx={{
                  textAlign: 'right',
                  fontSize: { xs: 13, sm: 15 },
                  fontWeight: 700,
                  color: USER_COLORS.textPrimary,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {player.gamesPlayed}
              </Typography>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}
