import type { RouteObject } from 'react-router';

import { Outlet } from 'react-router';
import { lazy, Suspense } from 'react';

import AuthGuard from 'src/utils/authguard';
import { lazyRetry } from 'src/utils/lazy-retry';

import { UserLayout } from 'src/layouts/user';

import { LoadingScreen } from 'src/components/loading-screen';

import { usePathname } from '../hooks';

// ----------------------------------------------------------------------

const ShopPage = lazy(() => lazyRetry(() => import('src/pages/user/shop')));
const WalletPage = lazy(() => lazyRetry(() => import('src/pages/user/wallet')));
const TransferPage = lazy(() => lazyRetry(() => import('src/pages/user/transfer')));
const WithdrawalPage = lazy(() => lazyRetry(() => import('src/pages/user/withdrawal')));

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
      { index: true, element: <ShopPage /> },
      { path: 'shop', element: <ShopPage /> },
      { path: 'wallet', element: <WalletPage /> },
      { path: 'transfer', element: <TransferPage /> },
      { path: 'withdrawal', element: <WithdrawalPage /> },
    ],
  },
];

