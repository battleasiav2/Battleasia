import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { fDateTime } from 'src/utils/format-time';

import {
  getDefaultGlassTokens,
  getGlassShellSx,
  getGlassBadgeChipSx,
} from 'src/components/battle-glass-card';

import { USER_COLORS } from 'src/layouts/user';

import type { MatchDetailData } from '../match-types';

// ----------------------------------------------------------------------

type MatchDetailHeroProps = {
  match: MatchDetailData;
  bannerUrl: string;
};

export function MatchDetailHero({ match, bannerUrl }: MatchDetailHeroProps) {
  const tokens = getDefaultGlassTokens();

  return (
    <Box
      sx={getGlassShellSx(tokens, {
        position: 'relative',
        height: { xs: 280, sm: 340, md: 400 },
        p: 0,
        overflow: 'hidden',
      })}
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
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `
            linear-gradient(90deg, ${alpha('#000000', 0.82)} 0%, ${alpha('#000000', 0.35)} 55%, transparent 100%),
            linear-gradient(180deg, transparent 35%, ${alpha('#000000', 0.88)} 100%)
          `,
        }}
      />

      <Stack
        spacing={1.25}
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          p: { xs: 2.5, md: 4 },
          zIndex: 1,
        }}
      >
        {match.gameName ? (
          <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase', color: alpha(USER_COLORS.gold, 0.9) }}>
            {match.gameName}
          </Typography>
        ) : null}

        <Typography
          className="font-tr"
          sx={{
            fontSize: { xs: 28, sm: 36, md: 44 },
            fontWeight: 800,
            lineHeight: 1.05,
            textTransform: 'uppercase',
            color: USER_COLORS.textPrimary,
            letterSpacing: 0.5,
            textShadow: `0 4px 24px ${alpha('#000000', 0.8)}`,
          }}
        >
          {match.matchName}
        </Typography>

        <Stack direction="row" flexWrap="wrap" gap={1} alignItems="center">
          {match.matchSchedule ? (
            <Box sx={getGlassBadgeChipSx(tokens)}>
              <Typography sx={{ fontSize: 10, fontWeight: 700, px: 0.5 }}>
                {fDateTime(match.matchSchedule, 'DD/MM/YYYY hh:mm a')}
              </Typography>
            </Box>
          ) : null}
          {match.map ? (
            <Box sx={getGlassBadgeChipSx(tokens)}>
              <Typography sx={{ fontSize: 10, fontWeight: 700, px: 0.5, textTransform: 'uppercase' }}>
                {match.map}
              </Typography>
            </Box>
          ) : null}
          {match.teamType ? (
            <Box sx={getGlassBadgeChipSx(tokens)}>
              <Typography sx={{ fontSize: 10, fontWeight: 700, px: 0.5, textTransform: 'uppercase' }}>
                {match.teamType}
              </Typography>
            </Box>
          ) : null}
          {match.isJoined ? (
            <Box sx={{ ...getGlassBadgeChipSx(tokens), bgcolor: alpha(USER_COLORS.success, 0.15), border: `1px solid ${alpha(USER_COLORS.success, 0.35)}` }}>
              <Typography sx={{ fontSize: 10, fontWeight: 800, px: 0.5, color: USER_COLORS.success }}>
                JOINED
              </Typography>
            </Box>
          ) : null}
        </Stack>
      </Stack>
    </Box>
  );
}
