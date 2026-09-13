import type { ReactNode } from 'react';

import { UserArenaStrip } from 'src/layouts/user';

import { ORDERS_HERO_IMAGE } from '../my-orders-constants';

// ----------------------------------------------------------------------

type OrdersHeroProps = {
  title: string;
  action?: ReactNode;
};

export function OrdersHero({ title, action }: OrdersHeroProps) {
  return (
    <UserArenaStrip
      title={title}
      imageUrl={ORDERS_HERO_IMAGE}
      action={action}
      dense
    />
  );
}
