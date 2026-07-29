import type { ReactNode } from 'react';

import { Iconify } from 'src/components/iconify';
import { UserArenaStrip, UserArenaChip, USER_COLORS } from 'src/layouts/user';
import { useTranslate } from 'src/locales/use-locales';

import { REFERRAL_HERO_IMAGE } from '../referral-constants';

// ----------------------------------------------------------------------

type ReferralHeroProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export function ReferralHero({ title, subtitle, action }: ReferralHeroProps) {
  const { t } = useTranslate();

  return (
    <UserArenaStrip
      badge={t('referral.badgeInviteEarn')}
      title={title}
      subtitle={subtitle}
      imageUrl={REFERRAL_HERO_IMAGE}
      action={action}
      chip={
        <UserArenaChip
          icon={<Iconify icon="solar:users-group-rounded-bold" width={12} sx={{ color: USER_COLORS.gold }} />}
          label={t('referral.title')}
        />
      }
    />
  );
}
