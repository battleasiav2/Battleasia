import type { ReactNode } from 'react';

import { UserArenaStrip } from 'src/layouts/user';

import { REFERRAL_HERO_IMAGE } from '../referral-constants';

// ----------------------------------------------------------------------

type ReferralHeroProps = {
  title: string;
  action?: ReactNode;
};

export function ReferralHero({ title, action }: ReferralHeroProps) {
  return (
    <UserArenaStrip
      title={title}
      imageUrl={REFERRAL_HERO_IMAGE}
      action={action}
      dense
    />
  );
}
