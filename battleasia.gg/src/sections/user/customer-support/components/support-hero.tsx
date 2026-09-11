import type { ReactNode } from 'react';

import { Iconify } from 'src/components/iconify';
import { UserArenaStrip, UserArenaChip, USER_COLORS } from 'src/layouts/user';
import { useTranslate } from 'src/locales/use-locales';

import { SUPPORT_HERO_IMAGE } from '../customer-support-constants';

// ----------------------------------------------------------------------

type SupportHeroProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export function SupportHero({ title, subtitle, action }: SupportHeroProps) {
  const { t } = useTranslate();

  return (
    <UserArenaStrip
      dense
      badge={t('customerSupport.badgeLiveSupport') || 'Support'}
      title={title}
      subtitle={subtitle}
      imageUrl={SUPPORT_HERO_IMAGE}
      action={action}
      chip={
        <UserArenaChip
          icon={
            <Iconify
              icon="solar:headphones-round-sound-bold"
              width={12}
              sx={{ color: USER_COLORS.gold }}
            />
          }
          label={t('customerSupport.online') || 'Online'}
        />
      }
    />
  );
}
