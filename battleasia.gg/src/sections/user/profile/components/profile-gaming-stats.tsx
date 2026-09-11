import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { useTranslate } from 'src/locales/use-locales';
import { UserAnimatedStat, USER_COLORS, goldAlpha } from 'src/layouts/user';
import { Iconify } from 'src/components/iconify';

import type { ProfileGamingStats } from '../profile-stats-utils';

// ----------------------------------------------------------------------

type ProfileGamingStatsStripProps = {
  stats: ProfileGamingStats;
  loading?: boolean;
};

/** Compact merged gaming stats — one strip, short gaps. */
export function ProfileGamingStatsStrip({ stats, loading }: ProfileGamingStatsStripProps) {
  const { t } = useTranslate();

  const items = [
    {
      icon: 'solar:gamepad-bold',
      label: t('profile.matchesPlayed'),
      value: <UserAnimatedStat value={stats.gamesPlayed} variant="h5" fontWeight={700} />,
    },
    {
      icon: 'solar:cup-star-bold',
      label: t('profile.wins'),
      value: <UserAnimatedStat value={stats.wins} variant="h5" fontWeight={700} />,
    },
    {
      icon: 'solar:bomb-emoji-bold',
      label: t('profile.totalKilled'),
      value: <UserAnimatedStat value={stats.totalKills} variant="h5" fontWeight={700} />,
    },
    {
      icon: 'solar:chart-2-bold',
      label: t('profile.winRate'),
      value: (
        <Stack direction="row" alignItems="baseline" spacing={0.25}>
          <UserAnimatedStat value={stats.winRate} variant="h5" fontWeight={700} />
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'inherit' }}>%</Typography>
        </Stack>
      ),
    },
  ];

  return (
    <Box
      sx={{
        mb: 1.75,
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, minmax(0, 1fr))',
          md: 'repeat(4, minmax(0, 1fr))',
        },
        width: 1,
        bgcolor: alpha('#06090e', 0.72),
        border: `1px solid ${goldAlpha(0.28)}`,
        borderTop: `2px solid ${USER_COLORS.gold}`,
        boxShadow: `0 8px 24px ${alpha('#000000', 0.45)}`,
      }}
    >
      {items.map((stat, index, arr) => (
        <Box
          key={stat.label}
          sx={{
            minWidth: 0,
            px: { xs: 1.25, md: 1.5 },
            py: { xs: 1.25, md: 1.5 },
            borderRight: {
              xs: index % 2 === 0 ? `1px solid ${alpha('#ffffff', 0.08)}` : 'none',
              md: index < arr.length - 1 ? `1px solid ${alpha('#ffffff', 0.1)}` : 'none',
            },
            borderBottom: {
              xs: index < 2 ? `1px solid ${alpha('#ffffff', 0.08)}` : 'none',
              md: 'none',
            },
          }}
        >
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.5, minWidth: 0 }}>
            <Iconify icon={stat.icon} width={14} sx={{ color: USER_COLORS.gold, flexShrink: 0 }} />
            <Typography
              sx={{
                fontSize: { xs: 10, md: 11 },
                fontWeight: 700,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                color: alpha('#ffffff', 0.55),
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {stat.label}
            </Typography>
          </Stack>
          <Box
            sx={{
              fontSize: { xs: 18, md: 20 },
              fontWeight: 800,
              color: USER_COLORS.textPrimary,
              lineHeight: 1.15,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {loading ? '—' : stat.value}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
