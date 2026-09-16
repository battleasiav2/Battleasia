import { useEffect, useState } from 'react';

import { Box, Stack, Button, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { fDateTime } from 'src/utils/format-time';

import { useTranslate } from 'src/locales/use-locales';

import { Iconify } from 'src/components/iconify';
import CoinValue from 'src/components/coin-value';
import { getGlassBadgeChipSx, getDefaultGlassTokens } from 'src/components/battle-glass-card';

import { USER_COLORS, userGoldButtonSx, goldAlpha } from 'src/layouts/user';

import { MatchRoomDialog } from './match-room-dialog';
import { estimateMatchWinningPool } from '../match-prize-utils';
import { getMatchCapacityState } from '../match-capacity-utils';
import {
  getMatchBannerUrl,
  MATCH_BANNER_FALLBACK,
  type MatchCardProps,
} from '../match-types';

// ----------------------------------------------------------------------

function StatInline({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Typography
        sx={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: 0.6,
          color: USER_COLORS.textMuted,
          textTransform: 'uppercase',
          lineHeight: 1.2,
          mb: 0.35,
        }}
      >
        {label}
      </Typography>
      <Box
        sx={{
          fontSize: { xs: 12, sm: 13 },
          fontWeight: 700,
          color: USER_COLORS.textPrimary,
          display: 'flex',
          alignItems: 'center',
          minHeight: 18,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export function MatchCard({
  match,
  onJoin,
  joining = false,
  canJoin = true,
  isJoined = false,
  isPremiumUser = false,
  isResult = false,
}: MatchCardProps) {
  const { t } = useTranslate();
  const router = useRouter();
  const tokens = getDefaultGlassTokens();
  const primaryBanner = getMatchBannerUrl(match.banner, match.map);
  const [bannerSrc, setBannerSrc] = useState(primaryBanner);

  useEffect(() => {
    setBannerSrc(primaryBanner);
  }, [primaryBanner]);

  const isPremiumMatch = match.premiumOnly === true;
  const { joined, max, isFull: isMatchFull } = getMatchCapacityState(match);
  const buttonDisabled =
    joining || isJoined || !canJoin || isMatchFull || (isPremiumMatch && !isPremiumUser);
  const winningPool = estimateMatchWinningPool(match);
  const spotsPct = max > 0 ? Math.min(100, Math.round((joined / max) * 100)) : 0;

  const goToDetail = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!isResult) {
      router.push(paths.user.match(match.id));
    }
  };

  const handleCardClick = () => {
    if (isResult) {
      router.push(paths.user.matchResult(match.id));
    }
  };

  return (
    <Box
      onClick={isResult ? handleCardClick : undefined}
      sx={{
        position: 'relative',
        width: 1,
        height: { xs: 200, sm: 220 },
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
        borderRadius: '18px',
        bgcolor: 'rgba(22,22,24,0.72)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${alpha('#ffffff', 0.09)}`,
        boxShadow: '0 24px 60px -40px #000, inset 0 1px 0 rgba(255,255,255,0.05)',
        cursor: isResult ? 'pointer' : 'default',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.25s ease',
        '&:hover': {
          borderColor: goldAlpha(0.35),
          boxShadow: '0 28px 60px -32px #000, inset 0 1px 0 rgba(255,255,255,0.06)',
          transform: 'translateY(-2px)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          bgcolor: USER_COLORS.gold,
          zIndex: 2,
          pointerEvents: 'none',
        },
      }}
    >
      {/* Banner — left half (APK parity) */}
      <Box
        sx={{
          position: 'relative',
          width: { xs: '38%', sm: '42%' },
          flexShrink: 0,
          overflow: 'hidden',
          bgcolor: '#0a0a0a',
        }}
      >
        <Box
          component="img"
          src={bannerSrc}
          alt={match.matchName}
          loading="lazy"
          decoding="async"
          onError={() => {
            setBannerSrc((prev) => (prev === MATCH_BANNER_FALLBACK ? prev : MATCH_BANNER_FALLBACK));
          }}
          sx={{
            width: 1,
            height: 1,
            objectFit: 'cover',
            objectPosition: 'center',
            display: 'block',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(90deg, transparent 40%, ${alpha('#161618', 0.92)} 100%)`,
          }}
        />

        <Stack
          direction="row"
          spacing={0.5}
          sx={{ position: 'absolute', top: 8, left: 8, right: 8, flexWrap: 'wrap' }}
        >
          {isPremiumMatch ? (
            <Box
              sx={{
                ...getGlassBadgeChipSx(tokens),
                bgcolor: goldAlpha(0.2),
                color: USER_COLORS.gold,
                border: `1px solid ${goldAlpha(0.35)}`,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={0.35} sx={{ px: 0.35 }}>
                <Iconify icon="solar:crown-bold" width={11} />
                <Typography sx={{ fontSize: 9, fontWeight: 800 }}>PREMIUM</Typography>
              </Stack>
            </Box>
          ) : null}
          {!isResult && isJoined ? (
            <Box sx={getGlassBadgeChipSx(tokens)}>
              <Typography sx={{ fontSize: 9, fontWeight: 800, px: 0.35 }}>JOINED</Typography>
            </Box>
          ) : null}
          {isResult ? (
            <Box
              sx={{
                ...getGlassBadgeChipSx(tokens),
                bgcolor: alpha(USER_COLORS.info, 0.15),
                border: `1px solid ${alpha(USER_COLORS.info, 0.35)}`,
              }}
            >
              <Typography sx={{ fontSize: 9, fontWeight: 800, px: 0.35, color: USER_COLORS.info }}>
                RESULT
              </Typography>
            </Box>
          ) : null}
        </Stack>
      </Box>

      {/* Info — right half */}
      <Stack
        spacing={0.85}
        sx={{
          flex: 1,
          minWidth: 0,
          p: { xs: 1.25, sm: 1.5 },
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            className="font-tr"
            onClick={goToDetail}
            sx={{
              fontSize: { xs: 13, sm: 15 },
              fontWeight: 800,
              color: USER_COLORS.textPrimary,
              textTransform: 'uppercase',
              lineHeight: 1.2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              cursor: isResult ? 'inherit' : 'pointer',
              '&:hover': isResult ? undefined : { color: USER_COLORS.gold },
            }}
          >
            {match.matchName}
          </Typography>

          <Typography
            sx={{
              mt: 0.4,
              fontSize: { xs: 11, sm: 12 },
              color: USER_COLORS.gold,
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {fDateTime(match.matchSchedule, 'DD/MM/YYYY hh:mm a')}
            {match.map ? ` · ${match.map}` : ''}
          </Typography>

          {!isResult ? (
            <Box sx={{ mt: 0.75 }}>
              <Typography
                sx={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  color: alpha('#ffffff', 0.42),
                  textTransform: 'uppercase',
                  mb: 0.35,
                }}
              >
                {joined}/{max} spots
              </Typography>
              <Box
                sx={{
                  height: 3,
                  borderRadius: 4,
                  bgcolor: alpha('#ffffff', 0.08),
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    width: `${spotsPct}%`,
                    height: 1,
                    bgcolor: USER_COLORS.gold,
                    borderRadius: 4,
                  }}
                />
              </Box>
            </Box>
          ) : null}
        </Box>

        <Stack direction="row" spacing={1} sx={{ py: 0.5 }}>
          <StatInline label={t('match.entryFee')}>
            <CoinValue value={match.entryFee ?? 0} size={12} />
          </StatInline>
          <StatInline label={t('match.prizePool')}>
            <CoinValue value={winningPool} size={12} />
          </StatInline>
          <StatInline label={t('match.perKill')}>
            <CoinValue value={match.perKill ?? 0} size={12} />
          </StatInline>
        </Stack>

        {!isResult && isJoined ? (
          <MatchRoomDialog
            match={match}
            trigger={
              <Typography
                component="span"
                sx={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                  color: USER_COLORS.gold,
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  '&:hover': { color: goldAlpha(0.8) },
                }}
              >
                {t('match.roomIdPassword')}
              </Typography>
            }
          />
        ) : null}

        {isResult ? (
          <Button
            fullWidth
            variant="outlined"
            disableElevation
            onClick={(e) => {
              e.stopPropagation();
              router.push(paths.user.matchResult(match.id));
            }}
            sx={{
              ...userGoldButtonSx,
              py: 0.75,
              minHeight: 40,
              fontSize: 12,
            }}
          >
            View Results
          </Button>
        ) : (
          <Button
            fullWidth
            variant="outlined"
            disableElevation
            disabled={buttonDisabled && !isJoined}
            onClick={(e) => {
              e.stopPropagation();
              onJoin(match);
            }}
            sx={{
              ...userGoldButtonSx,
              py: 0.75,
              minHeight: 40,
              fontSize: 12,
            }}
          >
            {isJoined ? (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <CoinValue value={match.entryFee} size={13} />
                <Typography sx={{ fontSize: 12, fontWeight: 800, color: 'inherit' }}>SPECTATE</Typography>
              </Stack>
            ) : isPremiumMatch && !isPremiumUser ? (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Iconify icon="solar:crown-bold" width={14} />
                <Typography sx={{ fontSize: 12, fontWeight: 800, color: 'inherit' }}>
                  PREMIUM ONLY
                </Typography>
              </Stack>
            ) : isMatchFull ? (
              <Typography sx={{ fontSize: 12, fontWeight: 800, letterSpacing: 0.6, color: 'inherit' }}>
                {t('match.matchFull')}
              </Typography>
            ) : joining ? (
              'JOINING...'
            ) : (
              'JOIN MATCH'
            )}
          </Button>
        )}
      </Stack>
    </Box>
  );
}
