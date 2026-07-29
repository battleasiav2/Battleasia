import type { ReactNode } from 'react';

import { Iconify } from 'src/components/iconify';
import { UserArenaStrip, UserArenaChip, USER_COLORS } from 'src/layouts/user';
import { useTranslate } from 'src/locales/use-locales';

import { SHOP_HERO_IMAGE } from './shop-constants';

// ----------------------------------------------------------------------

type ShopHeroProps = {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
};

export function ShopHero({ title, subtitle, action }: ShopHeroProps) {
  const { t } = useTranslate();

  return (
    <UserArenaStrip
      badge={t('shop.badgeOfficial')}
      title={title || t('shop.heroTitle')}
      subtitle={subtitle || t('shop.heroSubtitle')}
      imageUrl={SHOP_HERO_IMAGE}
      action={action}
      chip={
        <UserArenaChip
          icon={<Iconify icon="solar:shield-check-bold" width={12} sx={{ color: USER_COLORS.gold }} />}
          label={t('shop.chipVerified')}
        />
      }
    />
  );
}
