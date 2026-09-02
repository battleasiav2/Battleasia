import { Box, Stack, Typography } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';

import { fDateTime } from 'src/utils/format-time';
import { BattleGoldDivider } from 'src/components/battle-gold-divider';

import { USER_COLORS } from 'src/layouts/user';

import type { MatchDetailData } from '../match-types';
import { goldAlpha } from 'src/theme/accent-presets';

// ----------------------------------------------------------------------

const GOLD = USER_COLORS.gold;

const kenBurns = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.06); }
  100% { transform: scale(1); }
`;

const chipSx = {
  px: 1,
  py: 0.4,
  border: `1px solid ${alpha('#ffffff', 0.18)}`,
  bgcolor: alpha('#000000', 0.5),
  backdropFilter: 'blur(6px)',
};

type MatchDetailHeroProps = {
  match: MatchDetailData;
  bannerUrl: string;
};

export function MatchDetailHero({ match, bannerUrl }: MatchDetailHeroProps) {
  return (
    <Box
      sx={{
        position: 'relative',
        width: 'auto',
        mx: { xs: -2, sm: -3, md: -4 },
        mt: { xs: -2, md: -3 },
        mb: { xs: 2.5, md: 3.5 },
        minHeight: { xs: 260, sm: 320, md: 380 },
        display: 'flex',
        alignItems: 'flex-end',
        overflow: 'hidden',
        bgcolor: '#000000',
        borderTop: `1px solid ${goldAlpha(0.16)}`,
        borderBottom: `1px solid ${goldAlpha(0.16)}`,
      }}
    >
      <Box
        component="img"
        src={bannerUrl}
        alt={match.matchName}
        sx={{
          position: 'absolute',
          inset: 0,
          width: 1,
          height: 1,
          objectFit: 'cover',
          objectPosition: 'center',
          animation: `${kenBurns} 22s ease-in-out infinite`,
          '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `
            linear-gradient(90deg, ${alpha('#000000', 0.88)} 0%, ${alpha('#000000', 0.45)} 55%, ${alpha('#000000', 0.3)} 100%),
            linear-gradient(180deg, ${alpha('#000000', 0.4)} 0%, transparent 35%, ${alpha('#000000', 0.9)} 100%),
            radial-gradient(ellipse 50% 40% at 20% 25%, ${goldAlpha(0.1)} 0%, transparent 60%)
          `,
        }}
      />

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
        {match.gameName ? (
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 1.6,
              textTransform: 'uppercase',
              color: goldAlpha(0.9),
            }}
          >
            {match.gameName}
          </Typography>
        ) : null}

        <Typography
          className="font-tr"
          sx={{
            fontSize: { xs: 26, sm: 34, md: 42 },
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

        <Stack direction="row" flexWrap="wrap" gap={1} alignItems="center">
          {match.matchSchedule ? (
            <Box sx={chipSx}>
              <Typography sx={{ fontSize: 10, fontWeight: 700, color: alpha('#ffffff', 0.88) }}>
                {fDateTime(match.matchSchedule, 'DD/MM/YYYY hh:mm a')}
              </Typography>
            </Box>
          ) : null}
          {match.map ? (
            <Box sx={chipSx}>
              <Typography sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: alpha('#ffffff', 0.88) }}>
                {match.map}
              </Typography>
            </Box>
          ) : null}
          {match.teamType ? (
            <Box sx={chipSx}>
              <Typography sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: alpha('#ffffff', 0.88) }}>
                {match.teamType}
              </Typography>
            </Box>
          ) : null}
          {match.isJoined ? (
            <Box sx={{ ...chipSx, borderColor: alpha(USER_COLORS.success, 0.4), bgcolor: alpha(USER_COLORS.success, 0.12) }}>
              <Typography sx={{ fontSize: 10, fontWeight: 800, color: USER_COLORS.success }}>JOINED</Typography>
            </Box>
          ) : null}
        </Stack>
      </Stack>
    </Box>
  );
}
