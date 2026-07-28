import { Box, Stack, Typography } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';

import { fDateTime } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';
import { BattleGoldDivider } from 'src/components/battle-gold-divider';

import { USER_COLORS } from 'src/layouts/user';
import { useTranslate } from 'src/locales/use-locales';

import type { MatchResultData } from '../match-types';

// ----------------------------------------------------------------------

const GOLD = USER_COLORS.gold;

const kenBurns = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const chipSx = {
  px: 1,
  py: 0.4,
  border: `1px solid ${alpha('#ffffff', 0.18)}`,
  bgcolor: alpha('#000000', 0.5),
  backdropFilter: 'blur(6px)',
};

type MatchResultHeroProps = {
  match: MatchResultData;
  mapImageUrl: string;
  onMapError: (e: React.SyntheticEvent<HTMLImageElement>) => void;
};

export function MatchResultHero({ match, mapImageUrl, onMapError }: MatchResultHeroProps) {
  const { t } = useTranslate();

  return (
    <Box
      sx={{
        position: 'relative',
        width: 'auto',
        mx: { xs: -2, sm: -3, md: -4 },
        mt: { xs: -2, md: -3 },
        mb: { xs: 2.5, md: 3.5 },
        minHeight: { xs: 250, sm: 300, md: 360 },
        display: 'flex',
        alignItems: 'flex-end',
        overflow: 'hidden',
        bgcolor: '#000000',
        borderTop: `1px solid ${alpha(GOLD, 0.16)}`,
        borderBottom: `1px solid ${alpha(GOLD, 0.16)}`,
      }}
    >
      <Box
        component="img"
        src={mapImageUrl}
        alt={match.map}
        onError={onMapError}
        sx={{
          position: 'absolute',
          inset: 0,
          width: 1,
          height: 1,
          objectFit: 'cover',
          animation: `${kenBurns} 22s ease-in-out infinite`,
          '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `
            linear-gradient(90deg, ${alpha('#000000', 0.88)} 0%, ${alpha('#000000', 0.48)} 55%, ${alpha('#000000', 0.32)} 100%),
            linear-gradient(180deg, ${alpha('#000000', 0.4)} 0%, transparent 32%, ${alpha('#000000', 0.92)} 100%)
          `,
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 2,
          px: 1.1,
          py: 0.45,
          border: `1px solid ${alpha(GOLD, 0.45)}`,
          bgcolor: alpha('#000000', 0.55),
        }}
      >
        <Typography sx={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.8, color: GOLD }}>
          {t('match.badgeCompleted')}
        </Typography>
      </Box>

      <Stack
        spacing={1.25}
        sx={{
          position: 'relative',
          zIndex: 2,
          width: 1,
          px: { xs: 2.5, md: 4 },
          py: { xs: 2.5, md: 3.5 },
          maxWidth: { md: 720 },
        }}
      >
        <Stack direction="row" flexWrap="wrap" gap={0.75}>
          {match.matchType ? (
            <Box sx={chipSx}>
              <Typography sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: alpha('#ffffff', 0.88) }}>
                {match.matchType}
              </Typography>
            </Box>
          ) : null}
          {match.teamType ? (
            <Box sx={{ ...chipSx, borderColor: alpha(USER_COLORS.info, 0.35) }}>
              <Typography sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: USER_COLORS.info }}>
                {match.teamType}
              </Typography>
            </Box>
          ) : null}
          {match.map ? (
            <Box sx={chipSx}>
              <Typography sx={{ fontSize: 10, fontWeight: 700, color: alpha('#ffffff', 0.88) }}>{match.map}</Typography>
            </Box>
          ) : null}
        </Stack>

        <Typography
          className="font-tr"
          sx={{
            fontSize: { xs: 24, sm: 32, md: 40 },
            fontWeight: 800,
            lineHeight: 1.05,
            textTransform: 'uppercase',
            color: '#ffffff',
            letterSpacing: 0.4,
            textShadow: `0 4px 24px ${alpha('#000000', 0.85)}`,
          }}
        >
          {match.matchName}
        </Typography>

        <BattleGoldDivider variant="title" sx={{ width: { xs: 120, md: 160 } }} />

        {match.matchSchedule ? (
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Iconify icon="solar:calendar-bold" width={16} sx={{ color: alpha('#ffffff', 0.65) }} />
            <Typography sx={{ fontSize: 13, color: alpha('#ffffff', 0.82) }}>
              {fDateTime(match.matchSchedule, 'DD/MM/YYYY hh:mm a')}
            </Typography>
          </Stack>
        ) : null}
      </Stack>
    </Box>
  );
}
