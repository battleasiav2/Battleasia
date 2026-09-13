import type { ReactNode } from 'react';

import { UserArenaStrip } from 'src/layouts/user';

import { NOTIFICATIONS_HERO_IMAGE } from '../notifications-constants';

// ----------------------------------------------------------------------

type NotificationsHeroProps = {
  title: string;
  action?: ReactNode;
};

export function NotificationsHero({ title, action }: NotificationsHeroProps) {
  return (
    <UserArenaStrip
      title={title}
      imageUrl={NOTIFICATIONS_HERO_IMAGE}
      action={action}
      dense
    />
  );
}
