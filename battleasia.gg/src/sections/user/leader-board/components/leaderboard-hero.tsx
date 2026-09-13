import type { ReactNode } from 'react';

import { Box } from '@mui/material';
import { keyframes } from '@mui/material/styles';

import { UserArenaStrip, UserArenaChip, USER_COLORS } from 'src/layouts/user';

import { LEADERBOARD_HERO_IMAGE } from '../leader-board-constants';

// ----------------------------------------------------------------------

const livePulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.45; transform: scale(1.35); }
`;

type LeaderboardHeroProps = {
  title: string;
  action?: ReactNode;
  liveLabel?: string;
};

export function LeaderboardHero({ title, action, liveLabel = 'LIVE' }: LeaderboardHeroProps) {
  return (
    <UserArenaStrip
      title={title}
      imageUrl={LEADERBOARD_HERO_IMAGE}
      action={action}
      chip={
        <UserArenaChip
          icon={
            <Box sx={{ position: 'relative', width: 12, height: 12 }}>
              <Box
                sx={{
                  position: 'absolute',
                  inset: 2,
                  borderRadius: '50%',
                  bgcolor: USER_COLORS.gold,
                  animation: `${livePulse} 1.6s ease-in-out infinite`,
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  inset: 3.5,
                  borderRadius: '50%',
                  bgcolor: USER_COLORS.gold,
                }}
              />
            </Box>
          }
          label={liveLabel}
        />
      }
    />
  );
}
