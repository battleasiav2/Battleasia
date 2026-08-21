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
  getDefaultGlassTokens,
  getGlassBadgeChipSx,
  getGoldTopLineShellSx,
} from 'src/components/battle-glass-card';

import { USER_COLORS, userSolidGoldButtonSx, userGhostButtonSx } from 'src/layouts/user';

import { MatchStatPill } from './match-stat-pill';
import { MatchRoomDialog } from './match-room-dialog';
import { estimateMatchWinningPool } from '../match-prize-utils';
import {
  getMatchBannerUrl,
  MATCH_BANNER_FALLBACK,
  type MatchCardProps,
} from '../match-types';

// ----------------------------------------------------------------------

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
  const buttonDisabled = joining || isJoined || !canJoin || (isPremiumMatch && !isPremiumUser);
  const winningPool = estimateMatchWinningPool(match);
  const showJoinCta = !isJoined && !(isPremiumMatch && !isPremiumUser) && !joining;

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
        // Soft glass-morphism over dark gaming surface
        bgcolor: alpha('#0a0a0c', 0.55),
        backgroundColor: alpha('#0a0a0c', 0.55),
        backgroundImage: `
          linear-gradient(145deg, ${alpha('#ffffff', 0.06)} 0%, transparent 42%, ${alpha(USER_COLORS.gold, 0.04)} 100%)
        `,
        backdropFilter: 'blur(18px) saturate(1.15)',
        WebkitBackdropFilter: 'blur(18px) saturate(1.15)',
        border: `1px solid ${alpha('#ffffff', 0.12)}`,
        boxShadow: `
          inset 0 1px 0 ${alpha('#ffffff', 0.08)},
          0 12px 36px ${alpha('#000000', 0.45)},
          0 0 0 1px ${alpha(USER_COLORS.gold, 0.06)}
        `,
        transition: 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.28s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          borderColor: alpha(USER_COLORS.gold, 0.35),
          boxShadow: `
            inset 0 1px 0 ${alpha('#ffffff', 0.1)},
            0 20px 48px ${alpha('#000000', 0.65)},
            0 0 28px ${alpha(USER_COLORS.gold, 0.12)}
          `,
        },
      })}
    >
      {/* Banner */}
      <Box sx={{ position: 'relative', height: 148, flexShrink: 0, overflow: 'hidden' }}>
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
            background: `linear-gradient(180deg, transparent 30%, ${alpha('#000000', 0.82)} 100%)`,
          }}
        />

        <Stack direction="row" spacing={0.75} sx={{ position: 'absolute', top: 10, left: 10, right: 10, flexWrap: 'wrap' }}>
          {isPremiumMatch ? (
            <Box sx={{ ...getGlassBadgeChipSx(tokens), bgcolor: alpha(USER_COLORS.gold, 0.2), color: USER_COLORS.gold, border: `1px solid ${alpha(USER_COLORS.gold, 0.35)}` }}>
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
            <Box sx={{ ...getGlassBadgeChipSx(tokens), bgcolor: alpha(USER_COLORS.info, 0.15), border: `1px solid ${alpha(USER_COLORS.info, 0.35)}` }}>
              <Typography sx={{ fontSize: 10, fontWeight: 800, px: 0.5, color: USER_COLORS.info }}>RESULT</Typography>
            </Box>
          ) : null}
        </Stack>
      </Box>

      {/* Body */}
      <Stack spacing={1.5} sx={{ p: 2, flex: 1, minHeight: 0, display: 'flex' }}>
        <Box sx={{ minHeight: 58 }}>
          <Typography
            className="font-tr"
            onClick={goToDetail}
            sx={{
              fontSize: 18,
              fontWeight: 800,
              color: USER_COLORS.textPrimary,
              textTransform: 'uppercase',
              lineHeight: 1.15,
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

          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 0.75 }}>
            <Typography sx={{ fontSize: 12, color: USER_COLORS.gold, fontWeight: 600 }}>
              {fDateTime(match.matchSchedule, 'DD/MM/YYYY hh:mm a')}
            </Typography>
            {match.map ? (
              <Typography sx={{ fontSize: 12, color: USER_COLORS.textMuted }}>
                · {match.map}
              </Typography>
            ) : null}
            <Typography sx={{ fontSize: 12, color: USER_COLORS.textMuted }}>
              · {match.totalPlayer} players
            </Typography>
          </Stack>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 1,
            alignItems: 'stretch',
          }}
        >
          {(
            [
              { label: t('match.entryFee'), value: match.entryFee ?? 0 },
              { label: t('match.prizePool'), value: winningPool },
              { label: t('match.perKill'), value: match.perKill ?? 0 },
            ] as const
          ).map((stat) => (
            <MatchStatPill
              key={stat.label}
              label={stat.label}
              minHeight={72}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                minWidth: 0,
              }}
            >
              <CoinValue
                value={stat.value}
                size={14}
                spacing={0.4}
                textSx={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: USER_COLORS.textPrimary,
                  whiteSpace: 'nowrap',
                  lineHeight: 1.15,
                }}
              />
            </MatchStatPill>
          ))}
        </Box>

        {!isResult ? (
          <Box sx={{ minHeight: 22, display: 'flex', alignItems: 'center', mt: 'auto' }}>
            {isJoined ? (
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
                      '&:hover': { color: alpha(USER_COLORS.gold, 0.8) },
                    }}
                  >
                    {t('match.roomIdPassword')}
                  </Typography>
                }
              />
            ) : null}
          </Box>
        ) : (
          <Box sx={{ mt: 'auto' }} />
        )}

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
              ...userGhostButtonSx,
              py: 1.1,
            }}
          >
            View Results
          </Button>
        ) : (
          <Button
            fullWidth
            variant={showJoinCta ? 'contained' : 'outlined'}
            disableElevation
            disabled={buttonDisabled && !isJoined}
            onClick={(e) => {
              e.stopPropagation();
              onJoin(match);
            }}
            sx={
              showJoinCta
                ? {
                    ...userSolidGoldButtonSx,
                    height: 'auto',
                    minHeight: 52,
                    py: 1.45,
                    fontSize: 14,
                    letterSpacing: 1.2,
                    boxShadow: `0 0 22px ${alpha(USER_COLORS.gold, 0.35)}, 0 8px 24px ${alpha('#000000', 0.4)}`,
                    '&:hover': {
                      background: 'linear-gradient(180deg, #fbbf24 0%, #f5c518 52%, #d4a017 100%)',
                      boxShadow: `0 0 28px ${alpha(USER_COLORS.gold, 0.5)}, 0 12px 28px ${alpha('#000000', 0.5)}`,
                    },
                  }
                : {
                    ...userGhostButtonSx,
                    minHeight: 40,
                    py: 0.9,
                    fontSize: 12,
                    opacity: 0.92,
                  }
            }
          >
            {isJoined ? (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <CoinValue value={match.entryFee} size={14} />
                <Typography sx={{ fontSize: 12, fontWeight: 800 }}>SPECTATE</Typography>
              </Stack>
            ) : isPremiumMatch && !isPremiumUser ? (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Iconify icon="solar:crown-bold" width={16} />
                <Typography sx={{ fontSize: 12, fontWeight: 800 }}>PREMIUM ONLY</Typography>
              </Stack>
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
