import type { ReactNode } from 'react';

import { Iconify } from 'src/components/iconify';
import { UserArenaStrip, UserArenaChip } from 'src/layouts/user';
import { useTranslate } from 'src/locales/use-locales';

import { USER_COLORS } from 'src/layouts/user';

import { WALLET_HERO_IMAGE } from '../wallet-constants';

// ----------------------------------------------------------------------

type WalletHeroProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export function WalletHero({ title, subtitle, action }: WalletHeroProps) {
  const { t } = useTranslate();

  return (
    <UserArenaStrip
      badge={t('wallet.badgeSecureVault')}
      title={title}
      subtitle={subtitle}
      imageUrl={WALLET_HERO_IMAGE}
      action={action}
      chip={
        <UserArenaChip
          icon={<Iconify icon="solar:wallet-money-bold" width={12} sx={{ color: USER_COLORS.gold }} />}
          label="BAC"
        />
      }
    />
  );
}
