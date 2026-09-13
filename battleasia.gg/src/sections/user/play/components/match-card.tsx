import { useEffect, useState } from 'react';

import { Box, Stack, Button, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { fDateTime } from 'src/utils/format-time';

import { useTranslate } from 'src/locales/use-locales';

import { Iconify } from 'src/components/iconify';
import CoinValue from 'src/components/coin-value';
import {
  getGlassBadgeChipSx,
  getDefaultGlassTokens,
  getGoldTopLineShellSx,
} from 'src/components/battle-glass-card';

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
    <Box sx={{ minWidth: 0 }}>
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
          fontSize: 13,
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
      sx={getGoldTopLineShellSx({
        p: 0,
        width: 1,
        height: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        cursor: isResult ? 'pointer' : 'default',
        bgcolor: '#161618',
        borderColor: alpha('#ffffff', 0.08),
        boxShadow: 'none',
        transition: 'border-color 0.2s ease',
        '&:hover': {
          borderColor: goldAlpha(0.4),
        },
      })}
    >
      <Box sx={{ position: 'relative', height: 120, flexShrink: 0, overflow: 'hidden' }}>
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
            bgcolor: '#0a0a0a',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, transparent 30%, ${alpha('#000000', 0.8)} 100%)`,
          }}
        />

        <Stack
          direction="row"
          spacing={0.75}
          sx={{ position: 'absolute', top: 10, left: 10, right: 10, flexWrap: 'wrap' }}
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
              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ px: 0.5 }}>
                <Iconify icon="solar:crown-bold" width={12} />
                <Typography sx={{ fontSize: 10, fontWeight: 800 }}>PREMIUM</Typography>
              </Stack>
            </Box>
          ) : null}
          {!isResult && isJoined ? (
            <Box sx={getGlassBadgeChipSx(tokens)}>
              <Typography sx={{ fontSize: 10, fontWeight: 800, px: 0.5 }}>JOINED</Typography>
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
              <Typography sx={{ fontSize: 10, fontWeight: 800, px: 0.5, color: USER_COLORS.info }}>
                RESULT
              </Typography>
            </Box>
          ) : null}
        </Stack>
      </Box>

      <Stack spacing={1.25} sx={{ p: 1.75, flex: 1, minHeight: 0, display: 'flex' }}>
        <Box>
          <Typography
            className="font-tr"
            onClick={goToDetail}
            sx={{
              fontSize: 15,
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

          <Typography sx={{ mt: 0.5, fontSize: 12, color: USER_COLORS.textMuted }}>
            <Box component="span" sx={{ color: USER_COLORS.gold, fontWeight: 600 }}>
              {fDateTime(match.matchSchedule, 'DD/MM/YYYY hh:mm a')}
            </Box>
            {match.map ? ` · ${match.map}` : ''}
            {!isResult ? ` · ${joined}/${max}` : ''}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 1.25,
            py: 1,
            borderTop: `1px solid ${alpha('#ffffff', 0.06)}`,
            borderBottom: `1px solid ${alpha('#ffffff', 0.06)}`,
          }}
        >
          <StatInline label={t('match.entryFee')}>
            <CoinValue value={match.entryFee ?? 0} size={13} />
          </StatInline>
          <StatInline label={t('match.prizePool')}>
            <CoinValue value={winningPool} size={13} />
          </StatInline>
          <StatInline label={t('match.perKill')}>
            <CoinValue value={match.perKill ?? 0} size={13} />
          </StatInline>
        </Box>

        {!isResult && isJoined ? (
          <MatchRoomDialog
            match={match}
            trigger={
              <Typography
                component="span"
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 0.6,
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
              mt: 'auto',
              py: 0.9,
              fontSize: 13,
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
              mt: 'auto',
              py: 0.9,
              fontSize: 13,
            }}
          >
            {isJoined ? (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <CoinValue value={match.entryFee} size={14} />
                <Typography sx={{ fontSize: 13, fontWeight: 800, color: 'inherit' }}>SPECTATE</Typography>
              </Stack>
            ) : isPremiumMatch && !isPremiumUser ? (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Iconify icon="solar:crown-bold" width={16} />
                <Typography sx={{ fontSize: 13, fontWeight: 800, color: 'inherit' }}>
                  PREMIUM ONLY
                </Typography>
              </Stack>
            ) : isMatchFull ? (
              <Typography sx={{ fontSize: 13, fontWeight: 800, letterSpacing: 0.6, color: 'inherit' }}>
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
