import { Box, Stack, Typography } from '@mui/material';

import { useTranslate } from 'src/locales/use-locales';
import { UserStatTile, UserAnimatedStat } from 'src/layouts/user';

import { homeMobileScrollGridSx } from 'src/sections/home/home-horizontal-scroll';

import type { ProfileGamingStats } from '../profile-stats-utils';

// ----------------------------------------------------------------------

type ProfileGamingStatsStripProps = {
  stats: ProfileGamingStats;
  loading?: boolean;
};

export function ProfileGamingStatsStrip({ stats, loading }: ProfileGamingStatsStripProps) {
  const { t } = useTranslate();

  return (
    <Box
      sx={{
        ...homeMobileScrollGridSx({ xs: 'repeat(4, minmax(148px, 1fr))', md: 'repeat(4, 1fr)' }),
        mb: 3,
      }}
    >
      <UserStatTile
        label={t('profile.matchesPlayed')}
        value={<UserAnimatedStat value={stats.gamesPlayed} variant="h5" fontWeight={700} />}
        loading={loading}
      />
      <UserStatTile
        label={t('profile.wins')}
        value={<UserAnimatedStat value={stats.wins} variant="h5" fontWeight={700} />}
        loading={loading}
      />
      <UserStatTile
        label={t('profile.totalKilled')}
        value={<UserAnimatedStat value={stats.totalKills} variant="h5" fontWeight={700} />}
        loading={loading}
      />
      <UserStatTile
        label={t('profile.winRate')}
        value={
          <Stack direction="row" alignItems="baseline" spacing={0.25}>
            <UserAnimatedStat value={stats.winRate} variant="h5" fontWeight={700} />
            <Typography sx={{ fontSize: 16, fontWeight: 700, color: 'inherit' }}>%</Typography>
          </Stack>
        }
        loading={loading}
      />
    </Box>
  );
}
