import { Box, Stack, Button, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { fDateTime } from 'src/utils/format-time';

import { toast } from 'react-hot-toast';

import { useTranslate } from 'src/locales/use-locales';

import { Iconify } from 'src/components/iconify';
import CoinValue from 'src/components/coin-value';
import {
  getDefaultGlassTokens,
  getGlassBadgeChipSx,
  getGoldTopLineShellSx,
} from 'src/components/battle-glass-card';

import { USER_COLORS, userGoldButtonSx } from 'src/layouts/user';

import { MatchStatPill } from './match-stat-pill';
import { MatchRoomDialog } from './match-room-dialog';
import { estimateMatchWinningPool } from '../match-prize-utils';
import { getMatchBannerUrl, type MatchCardProps } from '../match-types';


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
  const bannerUrl = getMatchBannerUrl(match.banner);
  const isPremiumMatch = match.premiumOnly === true;
  const buttonDisabled = joining || isJoined || !canJoin || (isPremiumMatch && !isPremiumUser);
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
        overflow: 'hidden',
        cursor: isResult ? 'pointer' : 'default',
        transition: 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.28s ease',
        '&:hover': isResult
          ? {
              transform: 'translateY(-4px)',
              boxShadow: `0 20px 48px ${alpha('#000000', 0.75)}, 0 0 28px ${alpha(USER_COLORS.gold, 0.1)}`,
            }
          : undefined,
      })}
    >
      {/* Banner */}
      <Box sx={{ position: 'relative', height: 148, overflow: 'hidden' }}>
        <Box
          component="img"
          src={bannerUrl}
          alt={match.matchName}
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
      <Stack spacing={1.5} sx={{ p: 2 }}>
        <Box>
          <Typography
            className="font-tr"
            onClick={goToDetail}
            sx={{
              fontSize: 18,
              fontWeight: 800,
              color: USER_COLORS.textPrimary,
              textTransform: 'uppercase',
              lineHeight: 1.15,
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
                  alignSelf: 'flex-start',
                  '&:hover': { color: alpha(USER_COLORS.gold, 0.8) },
                }}
              >
                Room ID & Password
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
              py: 1.1,
            }}
          >
            View Results
          </Button>
        ) : (
          <Button
            fullWidth
            variant="outlined"
            disableElevation
            disabled={buttonDisabled}
            onClick={(e) => {
              e.stopPropagation();
              onJoin(match);
            }}
            sx={{
              ...userGoldButtonSx,
              py: 1.1,
            }}
          >
            {isJoined ? (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <CoinValue value={match.entryFee} size={16} />
                <Typography sx={{ fontSize: 13, fontWeight: 800 }}>SPECTATE</Typography>
              </Stack>
            ) : isPremiumMatch && !isPremiumUser ? (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Iconify icon="solar:crown-bold" width={16} />
                <Typography sx={{ fontSize: 13, fontWeight: 800 }}>PREMIUM ONLY</Typography>
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
