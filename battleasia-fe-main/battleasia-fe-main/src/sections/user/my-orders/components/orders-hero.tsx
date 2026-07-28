import type { ReactNode } from 'react';

import { Iconify } from 'src/components/iconify';
import { UserArenaStrip, UserArenaChip, USER_COLORS } from 'src/layouts/user';
import { useTranslate } from 'src/locales/use-locales';

import { ORDERS_HERO_IMAGE } from '../my-orders-constants';

// ----------------------------------------------------------------------

type OrdersHeroProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export function OrdersHero({ title, subtitle, action }: OrdersHeroProps) {
  const { t } = useTranslate();

  return (
    <UserArenaStrip
      badge={t('myOrders.badgeOrderHistory')}
      title={title}
      subtitle={subtitle}
      imageUrl={ORDERS_HERO_IMAGE}
      action={action}
      chip={
        <UserArenaChip
          icon={<Iconify icon="solar:bag-check-bold" width={12} sx={{ color: USER_COLORS.gold }} />}
          label={t('myOrders.title')}
        />
      }
    />
  );
}
