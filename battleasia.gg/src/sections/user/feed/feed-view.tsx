import { lazy, Suspense, useMemo } from 'react';
import { useSearchParams } from 'react-router';

import { Box } from '@mui/material';

import { useTranslate } from 'src/locales/use-locales';
import { UserPageShell } from 'src/layouts/user';

import { FeedHero } from './components/feed-hero';
import { FeedHubTabs, parseFeedHubSection, type FeedHubSection } from './components/feed-hub-tabs';

// Tab panels — load only the active tab (TBT + route weight)
const FeedPostsPanel = lazy(() =>
  import('./components/feed-posts-panel').then((m) => ({ default: m.FeedPostsPanel }))
);
const ExploreView = lazy(() => import('./explore-view').then((m) => ({ default: m.ExploreView })));
const ReelsView = lazy(() => import('./reels-view').then((m) => ({ default: m.ReelsView })));
const SavedFeedsView = lazy(() =>
  import('./saved-view').then((m) => ({ default: m.SavedFeedsView }))
);
const MessagesView = lazy(() =>
  import('../messages/messages-view').then((m) => ({ default: m.MessagesView }))
);

// ----------------------------------------------------------------------

function TabFallback() {
  return <Box sx={{ minHeight: 420 }} aria-hidden />;
}

export function FeedView() {
  const { t } = useTranslate();
  const [searchParams, setSearchParams] = useSearchParams();
  const section = parseFeedHubSection(searchParams.get('tab'));

  const hero = useMemo(() => {
    const map: Record<FeedHubSection, { title: string; subtitle: string }> = {
      feed: { title: t('feed.title'), subtitle: t('feed.whatsNew') },
      explore: { title: t('explore.title'), subtitle: t('explore.subtitle') },
      reels: { title: t('reels.title'), subtitle: t('reels.subtitle') },
      saved: { title: t('saved.title'), subtitle: t('saved.subtitle') },
      messages: { title: t('messages.title'), subtitle: t('messages.subtitle') },
    };
    return map[section];
  }, [section, t]);

  const handleSectionChange = (next: FeedHubSection) => {
    const userId = searchParams.get('userId');
    const nextParams: Record<string, string> = { tab: next };
    if (next === 'messages' && userId) {
      nextParams.userId = userId;
    }
    setSearchParams(nextParams, { replace: true });
  };

  return (
    <UserPageShell contentSx={{ maxWidth: section === 'messages' ? 1100 : 1200, mx: 'auto' }}>
      <FeedHero title={hero.title} subtitle={hero.subtitle} />

      <FeedHubTabs active={section} onChange={handleSectionChange} />

      <Box sx={{ pt: 2, minHeight: 420 }}>
        <Suspense fallback={<TabFallback />}>
          {section === 'feed' ? <FeedPostsPanel /> : null}
          {section === 'explore' ? <ExploreView embedded /> : null}
          {section === 'reels' ? <ReelsView embedded /> : null}
          {section === 'saved' ? <SavedFeedsView embedded /> : null}
          {section === 'messages' ? <MessagesView embedded /> : null}
        </Suspense>
      </Box>
    </UserPageShell>
  );
}
