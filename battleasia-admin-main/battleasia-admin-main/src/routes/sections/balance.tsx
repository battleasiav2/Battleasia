import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
// auth
import AuthGuard from 'src/utils/authguard';
// layouts
import DashboardLayout from 'src/layouts/dashboard';
// components
import { LoadingScreen } from 'src/components/loading-screen';

const BalanceHistoriesPage = lazy(() => import('src/pages/payments/balance-histories'));

export const balanceRoutes = [
  {
    path: 'balance',
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
      { element: <BalanceHistoriesPage />, index: true },
      { path: 'balance-histories', element: <BalanceHistoriesPage /> },
    ],
  },
];
