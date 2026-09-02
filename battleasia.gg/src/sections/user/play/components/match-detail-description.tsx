import { Box, Stack, Divider, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { fDateTime } from 'src/utils/format-time';

import CoinValue from 'src/components/coin-value';
import { getDefaultGlassTokens, getGlassShellSx } from 'src/components/battle-glass-card';

import { USER_COLORS, goldAlpha } from 'src/layouts/user';

import type { MatchDetailData } from '../match-types';

// ----------------------------------------------------------------------

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

function DetailSection({ title, children }: SectionProps) {
  return (
    <Box>
      <Typography
        className="font-tr"
        sx={{
          fontSize: 18,
          fontWeight: 800,
          textTransform: 'uppercase',
          color: USER_COLORS.gold,
          letterSpacing: 0.5,
          mb: 1.25,
        }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
}

type MatchDetailDescriptionProps = {
  match: MatchDetailData;
  labels: {
    prizeDetails: string;
    prize: string;
    perKill: string;
    matchSponsor: string;
    aboutThisMatch: string;
    noDescription: string;
    matchPrivateDescription: string;
    noPrivateDescription: string;
    joinToViewPrivate: string;
  };
};

export function MatchDetailDescription({ match, labels }: MatchDetailDescriptionProps) {
  const tokens = getDefaultGlassTokens();

  return (
    <Stack spacing={3} divider={<Divider sx={{ borderColor: alpha('#ffffff', 0.08) }} />}>
      <DetailSection title={labels.prizeDetails}>
        <Box sx={getGlassShellSx(tokens, { p: 2 })}>
          <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
              <Typography sx={{ fontSize: 12, color: USER_COLORS.textMuted }}>{labels.prize}</Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: USER_COLORS.textPrimary, textAlign: 'right' }}>
                {match.prizeDescription || 'N/A'}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography sx={{ fontSize: 12, color: USER_COLORS.textMuted }}>{labels.perKill}</Typography>
              <CoinValue value={match.perKill ?? 0} size={18} />
            </Stack>
            {match.matchSchedule ? (
              <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                <Typography sx={{ fontSize: 12, color: USER_COLORS.textMuted }}>Schedule</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: USER_COLORS.textPrimary }}>
                  {fDateTime(match.matchSchedule, 'DD/MM/YYYY hh:mm a')}
                </Typography>
              </Stack>
            ) : null}
          </Stack>
        </Box>
      </DetailSection>

      <DetailSection title={labels.matchSponsor}>
        <Typography sx={{ fontSize: 14, color: alpha('#ffffff', 0.78), lineHeight: 1.7 }}>
          {match.matchSponsor || 'N/A'}
        </Typography>
      </DetailSection>

      <DetailSection title={labels.aboutThisMatch}>
        <Typography
          sx={{
            fontSize: 14,
            color: alpha('#ffffff', 0.78),
            lineHeight: 1.8,
            whiteSpace: 'pre-line',
          }}
        >
          {match.matchDescription || labels.noDescription}
        </Typography>
      </DetailSection>

      <DetailSection title={labels.matchPrivateDescription}>
        <Box
          sx={getGlassShellSx(tokens, {
            p: 2,
            borderColor: match.isJoined ? goldAlpha(0.2) : alpha('#ffffff', 0.1),
          })}
        >
          <Typography sx={{ fontSize: 14, color: alpha('#ffffff', 0.78), lineHeight: 1.7 }}>
            {match.isJoined
              ? match.matchPrivateDescription || labels.noPrivateDescription
              : labels.joinToViewPrivate}
          </Typography>
        </Box>
      </DetailSection>
    </Stack>
  );
}
