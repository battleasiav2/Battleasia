import { Box, Stack, Avatar, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { getDefaultGlassTokens, getGlassInnerSx } from 'src/components/battle-glass-card';

import { USER_COLORS, UserEmptyState } from 'src/layouts/user';

import type { MatchParticipant } from '../match-types';

// ----------------------------------------------------------------------

type MatchDetailParticipantsProps = {
  participants: MatchParticipant[];
  emptyLabel: string;
  teamLabel: string;
  positionLabel: string;
  playerLabel: string;
};

export function MatchDetailParticipants({
  participants,
  emptyLabel,
  teamLabel,
  positionLabel,
  playerLabel,
}: MatchDetailParticipantsProps) {
  const tokens = getDefaultGlassTokens();

  if (!participants.length) {
    return (
      <UserEmptyState
        icon="solar:users-group-rounded-bold-duotone"
        title={emptyLabel}
        sx={{ py: 4, border: 'none', bgcolor: 'transparent' }}
      />
    );
  }

  return (
    <Stack spacing={1}>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          px: 1.5,
          py: 0.75,
          display: { xs: 'none', sm: 'flex' },
        }}
      >
        <Typography sx={{ flex: 1, fontSize: 10, fontWeight: 700, letterSpacing: 0.8, color: USER_COLORS.textMuted, textTransform: 'uppercase' }}>
          {teamLabel}
        </Typography>
        <Typography sx={{ flex: 1, fontSize: 10, fontWeight: 700, letterSpacing: 0.8, color: USER_COLORS.textMuted, textTransform: 'uppercase' }}>
          {positionLabel}
        </Typography>
        <Typography sx={{ flex: 1.4, fontSize: 10, fontWeight: 700, letterSpacing: 0.8, color: USER_COLORS.textMuted, textTransform: 'uppercase' }}>
          {playerLabel}
        </Typography>
      </Stack>

      {participants.map((player, index) => (
        <Box
          key={player.id}
          sx={getGlassInnerSx(tokens, {
            p: 1.5,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: { xs: 1, sm: 1.5 },
          })}
        >
          <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1, minWidth: 0 }}>
            <Avatar
              src={player.avatar}
              sx={{
                width: 32,
                height: 32,
                bgcolor: alpha(USER_COLORS.info, 0.2),
                color: '#e2e8f0',
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {(player.username || '?')[0]?.toUpperCase()}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 10, color: USER_COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, display: { sm: 'none' } }}>
                {teamLabel}
              </Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: USER_COLORS.textPrimary }}>
                {player.team || `Team ${index + 1}`}
              </Typography>
            </Box>
          </Stack>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 10, color: USER_COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, display: { sm: 'none' } }}>
              {positionLabel}
            </Typography>
            <Typography sx={{ fontFamily: 'monospace', fontSize: 13, color: alpha('#ffffff', 0.85) }}>
              {player.pubgId || '-'}
            </Typography>
          </Box>

          <Box sx={{ flex: 1.4, minWidth: 0 }}>
            <Typography sx={{ fontSize: 10, color: USER_COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, display: { sm: 'none' } }}>
              {playerLabel}
            </Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: USER_COLORS.textPrimary }}>
              {player.username}
            </Typography>
          </Box>
        </Box>
      ))}
    </Stack>
  );
}
