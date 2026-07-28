import type { ReactNode } from 'react';

import { Iconify } from 'src/components/iconify';
import { UserArenaStrip, UserArenaChip, USER_COLORS } from 'src/layouts/user';
import { useTranslate } from 'src/locales/use-locales';

import { LEADERBOARD_HERO_IMAGE } from '../leader-board-constants';

// ----------------------------------------------------------------------

type LeaderboardHeroProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export function LeaderboardHero({ title, subtitle, action }: LeaderboardHeroProps) {
  const { t } = useTranslate();

  return (
    <UserArenaStrip
      badge={t('leaderboard.badgeGlobalRankings')}
      title={title}
      subtitle={subtitle}
      imageUrl={LEADERBOARD_HERO_IMAGE}
      action={action}
      chip={
        <UserArenaChip
          icon={<Iconify icon="solar:cup-star-bold" width={12} sx={{ color: USER_COLORS.gold }} />}
          label="RANK"
        />
      }
    />
  );
}
