import { Box, Stack, Avatar, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import CoinValue from 'src/components/coin-value';
import { getGlassShellSx, getDefaultGlassTokens } from 'src/components/battle-glass-card';

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
        const height = rank === 1 ? 210 : rank === 2 ? 175 : 155;
        const isWinner = rank === 1;

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
              borderColor: alpha(rankColor, isWinner ? 0.55 : 0.35),
              boxShadow: isWinner
                ? `0 16px 40px ${alpha('#000000', 0.65)}, 0 0 32px ${alpha(rankColor, 0.22)}, inset 0 1px 0 ${alpha('#ffffff', 0.15)}`
                : `0 12px 32px ${alpha('#000000', 0.5)}, 0 0 20px ${alpha(rankColor, 0.12)}`,
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 20px 48px ${alpha('#000000', 0.7)}, 0 0 32px ${alpha(rankColor, 0.28)}`,
              },
              '&::before': isWinner
                ? {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: `linear-gradient(90deg, transparent, ${rankColor}, #ffffff, ${rankColor}, transparent)`,
                    boxShadow: `0 0 10px ${rankColor}`,
                  }
                : undefined,
            })}
          >
            <Box
              sx={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1,
              }}
            >
              <Iconify
                icon={isWinner ? 'solar:crown-bold' : 'solar:trophy-bold'}
                width={isWinner ? 32 : 24}
                sx={{
                  color: rankColor,
                  filter: `drop-shadow(0 0 8px ${alpha(rankColor, 0.6)})`,
                  animation: isWinner ? 'pulse 2.2s infinite' : undefined,
                }}
              />
            </Box>

            <Avatar
              src={formatResultAvatarUrl(participant.avatar)}
              alt={participant.username}
              sx={{
                width: isWinner ? 64 : 50,
                height: isWinner ? 64 : 50,
                mb: 1,
                border: `2px solid ${rankColor}`,
                boxShadow: `0 0 14px ${alpha(rankColor, 0.45)}`,
              }}
            />
            <Typography sx={{ fontSize: 11, fontWeight: 900, color: rankColor, letterSpacing: 1, mb: 0.5 }}>
              #{rank} {isWinner ? 'CHAMPION' : ''}
            </Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 800, color: USER_COLORS.textPrimary, mb: 0.25 }}>
              {participant.username}
            </Typography>
            <Stack direction="row" spacing={1.5} justifyContent="center" alignItems="center" sx={{ mt: 0.5 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 600, color: USER_COLORS.textMuted }}>
                {participant.kills} kills
              </Typography>
              {participant.winPrize > 0 ? <CoinValue value={participant.winPrize} size={13} /> : null}
            </Stack>
          </Box>
        );
      })}
    </Box>
  );
}
