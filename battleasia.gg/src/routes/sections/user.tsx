import type { RouteObject } from 'react-router';

import { Outlet, Navigate, useSearchParams } from 'react-router';
import { lazy, Suspense } from 'react';

import AuthGuard from 'src/utils/authguard';
import { lazyRetry } from 'src/utils/lazy-retry';

import { LoadingScreen } from 'src/components/loading-screen';

import { paths } from '../paths';
import { usePathname } from '../hooks';

// ----------------------------------------------------------------------

// Keep UserLayout (nav chrome) off anonymous home entry graph
const UserLayout = lazy(() =>
  lazyRetry(() => import('src/layouts/user').then((m) => ({ default: m.UserLayout })))
);
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
const ShopWalletPage = lazy(() => lazyRetry(() => import('src/pages/user/shop-wallet')));
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
    <Suspense fallback={<LoadingScreen />}>
      <Outlet key={pathname} />
    </Suspense>
  );
}

const userLayout = () => (
  <AuthGuard>
    <Suspense fallback={<LoadingScreen />}>
      <UserLayout>
        <SuspenseOutlet />
      </UserLayout>
    </Suspense>
  </AuthGuard>
);

function MessagesRedirect() {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const to = userId ? paths.user.messagesWithUser(userId) : paths.user.messages;
  return <Navigate to={to} replace />;
}

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
          { path: 'wallet', element: <Navigate to={paths.user.shopWallet} replace /> },
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
      { path: 'play/:matchId/detail', element: <MatchDetailPage /> },
      { path: 'play/:matchId/result', element: <MatchResultPage /> },
      { path: 'play/:gameId', element: <MatchPage /> },
      { path: 'shop', element: <ShopPage /> },
      { path: 'shop/wallet', element: <ShopWalletPage /> },
      { path: 'shop/:shopId', element: <ShopDetailPage /> },
      { path: 'earn', element: <Navigate to={paths.user.referral} replace /> },
      { path: 'referral', element: <ReferralPage /> },
      { path: 'feed', element: <FeedPage /> },
      { path: 'feed/:id', element: <FeedDetailPage /> },
      { path: 'explore', element: <Navigate to={paths.user.explore} replace /> },
      { path: 'saved', element: <Navigate to={paths.user.saved} replace /> },
      { path: 'reels', element: <Navigate to={paths.user.reels} replace /> },
      { path: 'messages', element: <MessagesRedirect /> },
    ],
  },
];

