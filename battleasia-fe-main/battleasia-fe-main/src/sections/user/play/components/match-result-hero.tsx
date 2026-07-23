import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { fDateTime } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';
import {
  getDefaultGlassTokens,
  getGlassShellSx,
  getGlassBadgeChipSx,
} from 'src/components/battle-glass-card';

import { USER_COLORS } from 'src/layouts/user';

import { useTranslate } from 'src/locales/use-locales';

import type { MatchResultData } from '../match-types';

// ----------------------------------------------------------------------

type MatchResultHeroProps = {
  match: MatchResultData;
  mapImageUrl: string;
  onMapError: (e: React.SyntheticEvent<HTMLImageElement>) => void;
};

export function MatchResultHero({ match, mapImageUrl, onMapError }: MatchResultHeroProps) {
  const { t } = useTranslate();
  const tokens = getDefaultGlassTokens();

  return (
    <Box
      sx={getGlassShellSx(tokens, {
        position: 'relative',
        height: { xs: 280, sm: 320, md: 380 },
        p: 0,
        overflow: 'hidden',
      })}
    >
      <Box
        component="img"
        src={mapImageUrl}
        alt={match.map}
        onError={onMapError}
        sx={{ position: 'absolute', inset: 0, width: 1, height: 1, objectFit: 'cover' }}
      />

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `
            linear-gradient(90deg, ${alpha('#000000', 0.85)} 0%, ${alpha('#000000', 0.4)} 55%, transparent 100%),
            linear-gradient(180deg, transparent 30%, ${alpha('#000000', 0.9)} 100%)
          `,
        }}
      />

      <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}>
        <Box sx={{ ...getGlassBadgeChipSx(tokens), border: `1px solid ${alpha(USER_COLORS.gold, 0.45)}`, color: USER_COLORS.gold }}>
          <Typography sx={{ fontSize: 10, fontWeight: 800, px: 0.5, letterSpacing: 0.8 }}>{t('match.badgeCompleted')}</Typography>
        </Box>
      </Box>

      <Stack spacing={1.25} sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: { xs: 2.5, md: 4 }, zIndex: 1 }}>
        <Stack direction="row" flexWrap="wrap" gap={0.75}>
          {match.matchType ? (
            <Box sx={getGlassBadgeChipSx(tokens)}>
              <Typography sx={{ fontSize: 10, fontWeight: 700, px: 0.5, textTransform: 'uppercase' }}>{match.matchType}</Typography>
            </Box>
          ) : null}
          {match.teamType ? (
            <Box sx={{ ...getGlassBadgeChipSx(tokens), bgcolor: alpha(USER_COLORS.info, 0.15), border: `1px solid ${alpha(USER_COLORS.info, 0.35)}` }}>
              <Typography sx={{ fontSize: 10, fontWeight: 700, px: 0.5, textTransform: 'uppercase', color: USER_COLORS.info }}>{match.teamType}</Typography>
            </Box>
          ) : null}
          {match.map ? (
            <Box sx={getGlassBadgeChipSx(tokens)}>
              <Typography sx={{ fontSize: 10, fontWeight: 700, px: 0.5 }}>{match.map}</Typography>
            </Box>
          ) : null}
        </Stack>

        <Typography
          className="font-tr"
          sx={{
            fontSize: { xs: 26, sm: 34, md: 42 },
            fontWeight: 800,
            lineHeight: 1.05,
            textTransform: 'uppercase',
            color: USER_COLORS.textPrimary,
            letterSpacing: 0.5,
          }}
        >
          {match.matchName}
        </Typography>

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
