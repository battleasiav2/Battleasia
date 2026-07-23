import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import AuthGuard from 'src/utils/authguard';
import DashboardLayout from 'src/layouts/dashboard';
import { LoadingScreen } from 'src/components/loading-screen';

const ShopPage = lazy(() => import('src/pages/shop/coinlist'));
const CoinRatePage = lazy(() => import('src/pages/shop/coinrate'));

export const shopRoutes = [
  {
    path: 'shop',
    element: (
      <AuthGuard>
        <DashboardLayout>
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </AuthGuard>
    ),
    children: [
      { element: <ShopPage />, index: true },
      { path: 'coinlist', element: <ShopPage /> },
      { path: 'coinrate', element: <CoinRatePage /> },
    ],
  },
];


