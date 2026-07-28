import type { ReactNode } from 'react';

import { Iconify } from 'src/components/iconify';
import { UserArenaStrip, UserArenaChip, USER_COLORS } from 'src/layouts/user';
import { useTranslate } from 'src/locales/use-locales';

import { NOTIFICATIONS_HERO_IMAGE } from '../notifications-constants';

// ----------------------------------------------------------------------

type NotificationsHeroProps = {
  title: string;
  unreadCount?: number;
  subtitle?: string;
  action?: ReactNode;
};

export function NotificationsHero({ title, unreadCount = 0, subtitle, action }: NotificationsHeroProps) {
  const { t } = useTranslate();

  return (
    <UserArenaStrip
      badge={t('notifications.badgeInbox')}
      title={title}
      subtitle={subtitle}
      imageUrl={NOTIFICATIONS_HERO_IMAGE}
      action={action}
      chip={
        unreadCount > 0 ? (
          <UserArenaChip
            icon={<Iconify icon="solar:bell-bing-bold" width={12} sx={{ color: USER_COLORS.gold }} />}
            label={`${unreadCount}`}
          />
        ) : (
          <UserArenaChip
            icon={<Iconify icon="solar:bell-bold" width={12} sx={{ color: USER_COLORS.gold }} />}
            label={t('notifications.title')}
          />
        )
      }
    />
  );
}
