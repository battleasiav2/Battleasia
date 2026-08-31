import { useCallback, useEffect, useState } from 'react';

import { alpha } from '@mui/material/styles';
import { Box, LinearProgress, Stack, Typography } from '@mui/material';

import useApi from 'src/hooks/use-api';
import { useTranslate } from 'src/locales/use-locales';

import {
  UserGlassCard,
  USER_COLORS,
  userMutedTextSx,
} from 'src/layouts/user';
import { getDefaultGlassTokens, getGlassInnerSx } from 'src/components/battle-glass-card';
import { Iconify } from 'src/components/iconify';

const BADGE_GOLD = '#feab02';

export type ProfileBadgeItem = {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  criteria: 'total_kills' | 'total_wins';
  threshold: number;
  tier: number;
  unlocked: boolean;
  unlockedAt?: string | Date | null;
  progress?: number;
  target?: number;
  current?: number;
};

type BadgeShowcaseData = {
  enabled: boolean;
  badges: ProfileBadgeItem[];
  unlockedCount: number;
  totalCount: number;
};

type Props = {
  userId?: string;
  isOwnProfile?: boolean;
};

function BadgeTile({ badge, showProgress }: { badge: ProfileBadgeItem; showProgress: boolean }) {
  const { t } = useTranslate();
  const glassTokens = getDefaultGlassTokens();
  const unlocked = badge.unlocked;
  const percent =
    badge.target && badge.target > 0
      ? Math.min(((badge.progress ?? badge.current ?? 0) / badge.target) * 100, 100)
      : 0;

  return (
    <Box
      sx={getGlassInnerSx(glassTokens, {
        p: { xs: 1.25, md: 1.5 },
        minHeight: 132,
        opacity: unlocked ? 1 : 0.72,
        border: unlocked ? `1px solid ${alpha(BADGE_GOLD, 0.35)}` : `1px solid ${alpha('#ffffff', 0.08)}`,
        bgcolor: unlocked ? alpha(BADGE_GOLD, 0.06) : undefined,
      })}
    >
      <Stack spacing={1} alignItems="center" textAlign="center">
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 1.5,
            display: 'grid',
            placeItems: 'center',
            bgcolor: alpha(unlocked ? BADGE_GOLD : '#ffffff', unlocked ? 0.14 : 0.06),
            color: unlocked ? BADGE_GOLD : alpha('#ffffff', 0.35),
            filter: unlocked ? 'none' : 'grayscale(1)',
          }}
        >
          <Iconify icon={badge.icon || 'solar:medal-ribbons-star-bold'} width={24} />
        </Box>

        <Box sx={{ minWidth: 0, width: '100%' }}>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: { xs: 12, md: 13 },
              color: unlocked ? USER_COLORS.textPrimary : alpha('#ffffff', 0.55),
              lineHeight: 1.25,
            }}
          >
            {badge.title}
          </Typography>
          <Typography sx={{ ...userMutedTextSx, fontSize: 10.5, mt: 0.35, lineHeight: 1.35 }}>
            {badge.description}
          </Typography>
        </Box>

        {showProgress && !unlocked ? (
          <Box sx={{ width: '100%' }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.35 }}>
              <Typography sx={{ ...userMutedTextSx, fontSize: 10 }}>
                {badge.progress ?? badge.current ?? 0}/{badge.target ?? badge.threshold}
              </Typography>
              <Typography sx={{ fontSize: 10, color: alpha(BADGE_GOLD, 0.85), fontWeight: 700 }}>
                {Math.round(percent)}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={percent}
              sx={{
                height: 5,
                borderRadius: 99,
                bgcolor: alpha('#ffffff', 0.08),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 99,
                  bgcolor: alpha(BADGE_GOLD, 0.65),
                },
              }}
            />
          </Box>
        ) : unlocked ? (
          <Typography sx={{ fontSize: 10.5, color: alpha('#22c55e', 0.95), fontWeight: 700 }}>
            {t('profile.badgeUnlocked')}
          </Typography>
        ) : null}
      </Stack>
    </Box>
  );
}

export function ProfileBadgesStrip({ userId, isOwnProfile = false }: Props) {
  const { t } = useTranslate();
  const { getEngagementBadgesApi, getUserEngagementBadgesApi } = useApi();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<BadgeShowcaseData | null>(null);

  const loadBadges = useCallback(async () => {
    if (!userId && !isOwnProfile) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = isOwnProfile
        ? await getEngagementBadgesApi()
        : userId
          ? await getUserEngagementBadgesApi(userId)
          : null;

      if (response?.data?.status) {
        setData(response.data.data);
      } else {
        setData(null);
      }
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [getEngagementBadgesApi, getUserEngagementBadgesApi, isOwnProfile, userId]);

  useEffect(() => {
    loadBadges();
  }, [loadBadges]);

  if (loading) {
    return (
      <UserGlassCard sx={{ p: { xs: 2, md: 2.5 }, mb: 3 }}>
        <Typography sx={{ ...userMutedTextSx, fontSize: 13, textAlign: 'center' }}>
          {t('common.loading')}
        </Typography>
      </UserGlassCard>
    );
  }

  if (!data?.enabled) return null;

  const badges = data.badges || [];
  if (badges.length === 0 && !isOwnProfile) return null;

  const unlockedBadges = badges.filter((badge) => badge.unlocked);
  const lockedBadges = badges.filter((badge) => !badge.unlocked);
  const displayBadges = isOwnProfile ? badges : unlockedBadges;

  return (
    <UserGlassCard sx={{ p: { xs: 2, md: 2.5 }, mb: 3 }}>
      <Stack spacing={1.5}>
        <Box>
          <Typography className="font-tr" sx={{ fontSize: { xs: 16, md: 18 }, fontWeight: 800, color: USER_COLORS.textPrimary }}>
            {t('profile.badgesTitle')}
          </Typography>
          <Typography sx={{ ...userMutedTextSx, fontSize: 12.5, mt: 0.35 }}>
            {isOwnProfile
              ? t('profile.badgesSubtitleOwn', { unlocked: data.unlockedCount, total: data.totalCount })
              : t('profile.badgesSubtitlePublic', { count: unlockedBadges.length })}
          </Typography>
        </Box>

        {displayBadges.length === 0 ? (
          <Typography sx={{ ...userMutedTextSx, fontSize: 13 }}>
            {t('profile.badgesEmpty')}
          </Typography>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, minmax(0, 1fr))',
                sm: 'repeat(3, minmax(0, 1fr))',
                md: 'repeat(4, minmax(0, 1fr))',
              },
              gap: { xs: 1, md: 1.25 },
            }}
          >
            {(isOwnProfile ? [...unlockedBadges, ...lockedBadges] : displayBadges).map((badge) => (
              <BadgeTile key={badge.id} badge={badge} showProgress={isOwnProfile} />
            ))}
          </Box>
        )}
      </Stack>
    </UserGlassCard>
  );
}
