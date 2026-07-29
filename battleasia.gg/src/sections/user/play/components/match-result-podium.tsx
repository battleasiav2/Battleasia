import { Box, Stack, Avatar, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import CoinValue from 'src/components/coin-value';
import { getDefaultGlassTokens, getGlassShellSx } from 'src/components/battle-glass-card';

import { USER_COLORS } from 'src/layouts/user';

import {
  MATCH_RANK_COLORS,
  formatResultAvatarUrl,
  type ResultParticipant,
} from '../match-types';

// ----------------------------------------------------------------------

const PODIUM_ORDER = [2, 1, 3] as const;

type MatchResultPodiumProps = {
  topThree: ResultParticipant[];
};

export function MatchResultPodium({ topThree }: MatchResultPodiumProps) {
  const tokens = getDefaultGlassTokens();

  if (!topThree.length) return null;

  const podiumMap = new Map(topThree.map((p) => [p.placement ?? 0, p]));

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
        gap: 1.5,
        alignItems: 'end',
      }}
    >
      {PODIUM_ORDER.map((rank) => {
        const participant = podiumMap.get(rank);
        if (!participant) {
          return <Box key={rank} sx={{ display: { xs: 'none', sm: 'block' } }} />;
        }

        const rankColor = MATCH_RANK_COLORS[rank];
        const height = rank === 1 ? 180 : rank === 2 ? 150 : 130;

        return (
          <Box
            key={participant.id}
            sx={getGlassShellSx(tokens, {
              p: 2,
              textAlign: 'center',
              minHeight: { xs: 'auto', sm: height },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-end',
              borderColor: alpha(rankColor, 0.35),
              boxShadow: `0 12px 32px ${alpha('#000000', 0.5)}, 0 0 24px ${alpha(rankColor, 0.12)}`,
            })}
          >
            <Iconify icon="solar:trophy-bold" width={rank === 1 ? 28 : 22} sx={{ color: rankColor, mb: 1 }} />
            <Avatar
              src={formatResultAvatarUrl(participant.avatar)}
              alt={participant.username}
              sx={{
                width: rank === 1 ? 56 : 48,
                height: rank === 1 ? 56 : 48,
                mb: 1,
                border: `2px solid ${rankColor}`,
              }}
            />
            <Typography sx={{ fontSize: 11, fontWeight: 800, color: rankColor, letterSpacing: 0.8, mb: 0.5 }}>
              #{rank}
            </Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: USER_COLORS.textPrimary, mb: 0.25 }}>
              {participant.username}
            </Typography>
            <Stack direction="row" spacing={1.5} justifyContent="center" sx={{ mt: 0.5 }}>
              <Typography sx={{ fontSize: 11, color: USER_COLORS.textMuted }}>{participant.kills} kills</Typography>
              {participant.winPrize > 0 ? <CoinValue value={participant.winPrize} size={12} /> : null}
            </Stack>
          </Box>
        );
      })}
    </Box>
  );
}
