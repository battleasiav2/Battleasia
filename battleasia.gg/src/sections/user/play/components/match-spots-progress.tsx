import { Box, Stack, Typography } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';

import { useTranslate } from 'src/locales/use-locales';

import { USER_COLORS } from 'src/layouts/user';

import { getMatchCapacityState, type MatchCapacityInput } from '../match-capacity-utils';

// ----------------------------------------------------------------------

const GOLD = USER_COLORS.gold;
const FULL_RED = '#ef4444';
const CARD_BG = '#161618';

const fillPulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.86; }
`;

const barSheen = keyframes`
  0% { transform: translateX(-120%); }
  100% { transform: translateX(320%); }
`;

type MatchSpotsProgressProps = MatchCapacityInput & {
  /** compact = match cards · default = inline · featured = confirm dialog */
  variant?: 'compact' | 'default' | 'featured';
};

function getBarHeight(variant: MatchSpotsProgressProps['variant']) {
  if (variant === 'compact') return 8;
  if (variant === 'featured') return 14;
  return 10;
}

function getVisualPercent(percent: number, joined: number) {
  if (joined <= 0) return 0;
  if (percent >= 100) return 100;
  return Math.max(percent, 6);
}

/** Gold fill bar — joined / admin totalPlayer (50/100 = half). */
export function MatchSpotsProgress({
  variant = 'default',
  ...match
}: MatchSpotsProgressProps) {
  const { t } = useTranslate();
  const { joined, max, percent, isFull, spotsLeft } = getMatchCapacityState(match);
  const nearlyFull = !isFull && percent >= 85;
  const visualPercent = getVisualPercent(percent, joined);
  const barHeight = getBarHeight(variant);
  const isFeatured = variant === 'featured';

  const fillBackground = isFull
    ? `linear-gradient(90deg, ${alpha(FULL_RED, 0.75)} 0%, ${FULL_RED} 48%, ${alpha('#f87171', 0.95)} 100%)`
    : nearlyFull
      ? `linear-gradient(90deg, ${alpha(GOLD, 0.7)} 0%, ${GOLD} 52%, ${alpha('#fbbf24', 0.98)} 100%)`
      : `linear-gradient(90deg, ${alpha(GOLD, 0.45)} 0%, ${GOLD} 50%, ${alpha('#fde68a', 0.95)} 100%)`;

  const barTrack = (
    <Box
      role="progressbar"
      aria-valuenow={joined}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={`${joined} of ${max} players joined`}
      sx={{
        position: 'relative',
        height: barHeight,
        borderRadius: 0,
        bgcolor: alpha('#ffffff', 0.06),
        border: `1px solid ${alpha('#ffffff', 0.12)}`,
        overflow: 'hidden',
        boxShadow: `inset 0 2px 6px ${alpha('#000000', 0.55)}`,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: `${visualPercent}%`,
          background: fillBackground,
          boxShadow: isFull
            ? `0 0 16px ${alpha(FULL_RED, 0.5)}`
            : `0 0 14px ${alpha(GOLD, 0.42)}`,
          transition: 'width 0.65s cubic-bezier(0.22, 1, 0.36, 1)',
          animation: nearlyFull || isFull ? `${fillPulse} 1.8s ease-in-out infinite` : undefined,
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, ${alpha('#ffffff', 0.28)} 0%, transparent 55%)`,
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '38%',
            height: '100%',
            background: `linear-gradient(90deg, transparent, ${alpha('#ffffff', 0.35)}, transparent)`,
            animation: joined > 0 ? `${barSheen} 2.4s ease-in-out infinite` : undefined,
            pointerEvents: 'none',
          },
        }}
      />
    </Box>
  );

  const header = (
    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
      <Stack direction="row" alignItems="center" spacing={0.75}>
        <Box
          sx={{
            width: isFeatured ? 3 : 2,
            height: isFeatured ? 14 : 10,
            bgcolor: isFull ? FULL_RED : GOLD,
            boxShadow: `0 0 10px ${alpha(isFull ? FULL_RED : GOLD, 0.45)}`,
          }}
        />
        <Typography
          sx={{
            fontSize: isFeatured ? 11 : variant === 'compact' ? 9 : 10,
            fontWeight: 800,
            letterSpacing: 0.8,
            textTransform: 'uppercase',
            color: alpha('#ffffff', isFeatured ? 0.78 : 0.55),
          }}
        >
          {t('match.spotsJoined')}
        </Typography>
      </Stack>

      <Stack direction="row" alignItems="center" spacing={0.85}>
        {isFull ? (
          <Box
            sx={{
              px: 0.75,
              py: 0.25,
              bgcolor: alpha(FULL_RED, 0.16),
              border: `1px solid ${alpha(FULL_RED, 0.42)}`,
            }}
          >
            <Typography sx={{ fontSize: 9, fontWeight: 800, color: FULL_RED, letterSpacing: 0.7 }}>
              {t('match.matchFull')}
            </Typography>
          </Box>
        ) : isFeatured && spotsLeft <= 10 ? (
          <Typography sx={{ fontSize: 9, fontWeight: 700, color: alpha(GOLD, 0.9), letterSpacing: 0.5 }}>
            {t('match.spotsLeft', { count: spotsLeft })}
          </Typography>
        ) : null}
        <Typography
          sx={{
            fontSize: isFeatured ? 13 : variant === 'compact' ? 10 : 11,
            fontWeight: 800,
            color: isFull ? FULL_RED : '#ffffff',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {joined}
          <Typography component="span" sx={{ color: alpha('#ffffff', 0.42), fontWeight: 700 }}>
            {' / '}
          </Typography>
          {max}
        </Typography>
        {isFeatured ? (
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 800,
              color: isFull ? FULL_RED : GOLD,
              fontVariantNumeric: 'tabular-nums',
              minWidth: 36,
              textAlign: 'right',
            }}
          >
            {Math.round(percent)}%
          </Typography>
        ) : null}
      </Stack>
    </Stack>
  );

  const content = (
    <Stack spacing={isFeatured ? 1 : variant === 'compact' ? 0.5 : 0.65} sx={{ width: 1 }}>
      {header}
      {barTrack}
      {isFeatured ? (
        <Typography sx={{ fontSize: 10, color: alpha('#ffffff', 0.45), lineHeight: 1.4 }}>
          {isFull ? t('match.matchFullHint') : t('match.spotsJoinedHint')}
        </Typography>
      ) : null}
    </Stack>
  );

  if (!isFeatured) {
    return content;
  }

  return (
    <Box
      sx={{
        p: 1.75,
        bgcolor: CARD_BG,
        border: `1px solid ${alpha('#ffffff', 0.08)}`,
        boxShadow: `
          inset 0 1px 0 ${alpha('#ffffff', 0.06)},
          0 8px 24px ${alpha('#000000', 0.35)}
        `,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          bgcolor: GOLD,
          boxShadow: `0 0 12px ${alpha(GOLD, 0.4)}`,
        },
      }}
    >
      {content}
    </Box>
  );
}
