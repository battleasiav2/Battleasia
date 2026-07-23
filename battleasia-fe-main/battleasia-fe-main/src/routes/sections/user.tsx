import type { RouteObject } from 'react-router';

import { Outlet } from 'react-router';
import { lazy, Suspense } from 'react';

import AuthGuard from 'src/utils/authguard';
import { lazyRetry } from 'src/utils/lazy-retry';

import { UserLayout } from 'src/layouts/user';

import { LoadingScreen } from 'src/components/loading-screen';

import { usePathname } from '../hooks';

// ----------------------------------------------------------------------

const ProfilePage = lazy(() => lazyRetry(() => import('src/pages/user/profile')));
const WalletPage = lazy(() => lazyRetry(() => import('src/pages/user/wallet')));
const MyMatchesPage = lazy(() => lazyRetry(() => import('src/pages/user/my-matches')));
const MyOrdersPage = lazy(() => lazyRetry(() => import('src/pages/user/my-orders')));
const MyStatisticsPage = lazy(() => lazyRetry(() => import('src/pages/user/my-statistics')));
const MyReferralsPage = lazy(() => lazyRetry(() => import('src/pages/user/my-referrals')));
const PlayPage = lazy(() => lazyRetry(() => import('src/pages/user/play')));
const MatchPage = lazy(() => lazyRetry(() => import('src/pages/user/match')));
const MatchDetailPage = lazy(() => lazyRetry(() => import('src/pages/user/match-detail')));
const MatchResultPage = lazy(() => lazyRetry(() => import('src/pages/user/match-result')));
const ShopPage = lazy(() => lazyRetry(() => import('src/pages/user/shop')));
const ShopDetailPage = lazy(() => lazyRetry(() => import('src/pages/user/shop-detail')));
const ReferralPage = lazy(() => lazyRetry(() => import('src/pages/user/referral')));
const FeedPage = lazy(() => lazyRetry(() => import('src/pages/user/feed')));
const FeedDetailPage = lazy(() => lazyRetry(() => import('src/pages/user/feed-detail')));
const NotificationsPage = lazy(() => lazyRetry(() => import('src/pages/user/notifications')));
const LeaderBoardPage = lazy(() => lazyRetry(() => import('src/pages/user/leader-board')));
const CustomerSupportPage = lazy(() => lazyRetry(() => import('src/pages/user/customer-support')));

// ----------------------------------------------------------------------

function SuspenseOutlet() {
  const pathname = usePathname();
  return (
    <Suspense key={pathname} fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  );
}

const userLayout = () => (
  <AuthGuard>
    <UserLayout>
      <SuspenseOutlet />
    </UserLayout>
  </AuthGuard>
);

export const userRoutes: RouteObject[] = [
  {
    path: 'user',
    element: userLayout(),
    children: [
      {
        path: 'account',
        element: <SuspenseOutlet />,
        children: [
          { path: 'profile/:userId', element: <ProfilePage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'wallet', element: <WalletPage /> },
          { path: 'my-matches', element: <MyMatchesPage /> },
          { path: 'my-orders', element: <MyOrdersPage /> },
          { path: 'my-statistics', element: <MyStatisticsPage /> },
          { path: 'my-referrals', element: <MyReferralsPage /> },
          { path: 'notifications', element: <NotificationsPage /> },
          { path: 'leader-board', element: <LeaderBoardPage /> },
          { path: 'customer-support', element: <CustomerSupportPage /> },
        ],
      },
      { path: 'play', element: <PlayPage /> },
      { path: 'play/:gameId', element: <MatchPage /> },
      { path: 'play/:matchId/detail', element: <MatchDetailPage /> },
      { path: 'play/:matchId/result', element: <MatchResultPage /> },
      { path: 'shop', element: <ShopPage /> },
      { path: 'shop/:shopId', element: <ShopDetailPage /> },
      { path: 'referral', element: <ReferralPage /> },
      { path: 'feed', element: <FeedPage /> },
      { path: 'feed/:id', element: <FeedDetailPage /> },
    ],
  },
];

