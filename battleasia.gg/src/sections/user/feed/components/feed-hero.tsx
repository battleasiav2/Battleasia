import { Iconify } from 'src/components/iconify';
import { UserArenaStrip, UserArenaChip, USER_COLORS } from 'src/layouts/user';
import { useTranslate } from 'src/locales/use-locales';

import { FEED_HERO_IMAGE } from '../feed-constants';

// ----------------------------------------------------------------------

type FeedHeroProps = {
  title: string;
  subtitle?: string;
  postCount?: number;
};

export function FeedHero({ title, subtitle, postCount = 0 }: FeedHeroProps) {
  const { t } = useTranslate();

  return (
    <UserArenaStrip
      badge={t('feed.badgeCommunity')}
      title={title}
      subtitle={subtitle}
      imageUrl={FEED_HERO_IMAGE}
      chip={
        <UserArenaChip
          icon={<Iconify icon="solar:document-text-bold" width={12} sx={{ color: USER_COLORS.gold }} />}
          label={postCount > 0 ? `${postCount} ${t('feed.posts')}` : t('feed.title')}
        />
      }
    />
  );
}
