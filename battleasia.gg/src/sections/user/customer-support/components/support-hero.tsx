import type { ReactNode } from 'react';

import { UserArenaStrip } from 'src/layouts/user';

import { SUPPORT_HERO_IMAGE } from '../customer-support-constants';

// ----------------------------------------------------------------------

type SupportHeroProps = {
  title: string;
  action?: ReactNode;
};

export function SupportHero({ title, action }: SupportHeroProps) {
  return (
    <UserArenaStrip
      title={title}
      imageUrl={SUPPORT_HERO_IMAGE}
      action={action}
      dense
    />
  );
}
