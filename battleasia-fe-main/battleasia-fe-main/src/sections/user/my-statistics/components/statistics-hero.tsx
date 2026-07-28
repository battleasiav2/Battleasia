import type { ReactNode } from 'react';

import { Iconify } from 'src/components/iconify';
import { UserArenaStrip, UserArenaChip, USER_COLORS } from 'src/layouts/user';
import { useTranslate } from 'src/locales/use-locales';

import { STATISTICS_HERO_IMAGE } from '../my-statistics-constants';

// ----------------------------------------------------------------------

type StatisticsHeroProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export function StatisticsHero({ title, subtitle, action }: StatisticsHeroProps) {
  const { t } = useTranslate();

  return (
    <UserArenaStrip
      badge={t('myStatistics.badgePerformanceTracker')}
      title={title}
      subtitle={subtitle}
      imageUrl={STATISTICS_HERO_IMAGE}
      action={action}
      chip={
        <UserArenaChip
          icon={<Iconify icon="solar:chart-bold" width={12} sx={{ color: USER_COLORS.gold }} />}
          label="STATS"
        />
      }
    />
  );
}
