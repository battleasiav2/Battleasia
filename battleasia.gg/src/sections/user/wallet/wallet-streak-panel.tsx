import { alpha } from '@mui/material/styles';
import { Box, Stack, Typography, CircularProgress } from '@mui/material';

import { useTranslate } from 'src/locales/use-locales';
import {
  UserGlassCard,
  UserActionButton,
  USER_COLORS,
  userMutedTextSx,
} from 'src/layouts/user';
import { getDefaultGlassTokens, getGlassInnerSx } from 'src/components/battle-glass-card';
import { Iconify } from 'src/components/iconify';
import { CoinValue } from 'src/components/coin-value';

const GOLD = '#feab02';

export type StreakCalendarDay = {
  date: string;
  checkedIn: boolean;
  claimed: boolean;
  isToday: boolean;
};

export type StreakState = {
  enabled: boolean;
  currentStreak: number;
  longestStreak: number;
  checkedInToday: boolean;
  claimedToday: boolean;
  canClaim: boolean;
  todayReward: number;
  baseReward: number;
  streakBonus: number;
  calendar: StreakCalendarDay[];
};

function formatDayLabel(dateKey: string) {
  const [, , day] = dateKey.split('-');
  return day || dateKey;
}

function formatWeekday(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  if (!year || !month || !day) return '';
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString(undefined, { weekday: 'short', timeZone: 'UTC' });
}

type Props = {
  streak: StreakState | null;
  claiming: boolean;
  onClaim: () => void;
};

export function WalletStreakPanel({ streak, claiming, onClaim }: Props) {
  const { t } = useTranslate();
  const glassTokens = getDefaultGlassTokens();

  if (!streak?.enabled) return null;

  return (
    <UserGlassCard sx={{ p: { xs: 2, md: 2.5 }, overflow: 'hidden' }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              bgcolor: alpha(GOLD, 0.14),
              border: `1px solid ${alpha(GOLD, 0.3)}`,
              color: GOLD,
              boxShadow: `0 0 24px ${alpha(GOLD, 0.12)}`,
            }}
          >
            <Iconify icon="solar:fire-bold" width={28} />
          </Box>
          <Box>
            <Typography className="font-tr" sx={{ fontSize: 12, fontWeight: 700, color: alpha(GOLD, 0.9), letterSpacing: 1, textTransform: 'uppercase' }}>
              {t('wallet.streakTitle')}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="baseline">
              <Typography sx={{ fontSize: { xs: 34, md: 40 }, fontWeight: 900, lineHeight: 1, color: USER_COLORS.textPrimary }}>
                {streak.currentStreak}
              </Typography>
              <Typography sx={{ ...userMutedTextSx, fontSize: 13 }}>
                {t('wallet.streakDays')}
              </Typography>
            </Stack>
          </Box>
        </Stack>

        <Stack spacing={0.5} alignItems={{ xs: 'flex-start', sm: 'flex-end' }}>
          <Typography sx={{ ...userMutedTextSx, fontSize: 12 }}>{t('wallet.streakBest', { count: streak.longestStreak })}</Typography>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Typography sx={{ fontSize: 12, color: USER_COLORS.textPrimary, fontWeight: 700 }}>
              {t('wallet.streakTodayReward')}
            </Typography>
            <CoinValue value={streak.todayReward} size={14} />
          </Stack>
          {streak.streakBonus > 0 ? (
            <Typography sx={{ fontSize: 11, color: alpha(GOLD, 0.85) }}>
              {t('wallet.streakBonusIncluded', { bonus: streak.streakBonus })}
            </Typography>
          ) : null}
        </Stack>
      </Stack>

      <Box sx={getGlassInnerSx(glassTokens, { p: { xs: 1.25, md: 1.5 }, mb: 2 })}>
        <Typography sx={{ ...userMutedTextSx, fontSize: 11, mb: 1.25, textTransform: 'uppercase', letterSpacing: 0.6 }}>
          {t('wallet.streakCalendar')}
        </Typography>
        <Stack
          direction="row"
          spacing={{ xs: 0.75, md: 1 }}
          sx={{
            overflowX: 'auto',
            pb: 0.5,
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {streak.calendar.map((day) => {
            const active = day.checkedIn || day.isToday;
            return (
              <Stack
                key={day.date}
                alignItems="center"
                spacing={0.5}
                sx={{ minWidth: { xs: 42, md: 48 }, flex: '0 0 auto' }}
              >
                <Typography sx={{ fontSize: 10, color: alpha('#ffffff', 0.45), fontWeight: 600 }}>
                  {formatWeekday(day.date)}
                </Typography>
                <Box
                  sx={{
                    width: { xs: 36, md: 40 },
                    height: { xs: 36, md: 40 },
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    border: day.isToday
                      ? `2px solid ${GOLD}`
                      : `1px solid ${alpha('#ffffff', active ? 0.18 : 0.08)}`,
                    bgcolor: day.claimed
                      ? alpha(GOLD, 0.22)
                      : day.checkedIn
                        ? alpha(GOLD, 0.1)
                        : alpha('#ffffff', 0.03),
                    color: day.claimed || day.checkedIn ? GOLD : alpha('#ffffff', 0.35),
                  }}
                >
                  {day.claimed ? (
                    <Iconify icon="solar:check-circle-bold" width={18} />
                  ) : day.checkedIn ? (
                    <Iconify icon="solar:fire-bold" width={16} />
                  ) : (
                    <Typography sx={{ fontSize: 11, fontWeight: 700 }}>{formatDayLabel(day.date)}</Typography>
                  )}
                </Box>
              </Stack>
            );
          })}
        </Stack>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} alignItems={{ sm: 'center' }} justifyContent="space-between">
        <Typography sx={{ ...userMutedTextSx, fontSize: 12.5, maxWidth: 420 }}>
          {streak.claimedToday
            ? t('wallet.streakComeBackTomorrow')
            : streak.canClaim
              ? t('wallet.streakClaimHint')
              : t('wallet.streakCheckInHint')}
        </Typography>

        {streak.canClaim ? (
          <UserActionButton
            actionVariant="gold"
            disabled={claiming}
            onClick={onClaim}
            startIcon={claiming ? <CircularProgress size={14} color="inherit" /> : <Iconify icon="solar:gift-bold" />}
            sx={{ minWidth: { sm: 160 } }}
          >
            {claiming ? t('wallet.earnClaiming') : t('wallet.streakClaim')}
          </UserActionButton>
        ) : streak.claimedToday ? (
          <Typography sx={{ fontSize: 12, color: alpha('#22c55e', 0.95), fontWeight: 700 }}>
            {t('wallet.streakClaimedToday')}
          </Typography>
        ) : null}
      </Stack>
    </UserGlassCard>
  );
}
