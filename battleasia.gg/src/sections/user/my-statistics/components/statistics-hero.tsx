import type { ReactNode } from 'react';

import { UserArenaStrip } from 'src/layouts/user';

import { STATISTICS_HERO_IMAGE } from '../my-statistics-constants';

// ----------------------------------------------------------------------

type StatisticsHeroProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export function StatisticsHero({ title, action }: StatisticsHeroProps) {
  return (
    <UserArenaStrip title={title} imageUrl={STATISTICS_HERO_IMAGE} dense action={action} />
  );
}
