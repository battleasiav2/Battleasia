import type { ReactNode } from 'react';

import { Iconify } from 'src/components/iconify';
import { UserArenaStrip, UserArenaChip, USER_COLORS, USER_IMAGES } from 'src/layouts/user';
import { useTranslate } from 'src/locales/use-locales';

// ----------------------------------------------------------------------

type WalletHeroProps = {
  title?: string;
  badge?: string;
  subtitle?: string;
  action?: ReactNode;
  chipLabel?: string;
  chipIcon?: string;
};

export function WalletHero({
  title,
  badge,
  subtitle,
  action,
  chipLabel,
  chipIcon = 'solar:wallet-money-bold',
}: WalletHeroProps) {
  const { t } = useTranslate();

  return (
    <UserArenaStrip
      badge={badge || t('wallet.badge')}
      title={title || t('wallet.title')}
      subtitle={subtitle || t('wallet.subtitle')}
      imageUrl={USER_IMAGES.pageBg}
      action={action}
      chip={
        <UserArenaChip
          icon={<Iconify icon={chipIcon} width={12} sx={{ color: USER_COLORS.gold }} />}
          label={chipLabel || 'BAC'}
        />
      }
    />
  );
}
