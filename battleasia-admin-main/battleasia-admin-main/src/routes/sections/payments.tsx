import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
// auth
import AuthGuard from 'src/utils/authguard';
// layouts
import DashboardLayout from 'src/layouts/dashboard';
// components
import { LoadingScreen } from 'src/components/loading-screen';

const WalletPage = lazy(() => import('src/pages/payments/wallet'));
const DepositPage = lazy(() => import('src/pages/payments/deposit'));
const WithdrawalPage = lazy(() => import('src/pages/payments/withdrawal'));

export const paymentsRoutes = [
  {
    path: 'payments',
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
      { element: <WalletPage />, index: true },
      { path: 'wallet', element: <WalletPage /> },
      { path: 'deposit', element: <DepositPage /> },
      { path: 'withdrawal', element: <WithdrawalPage /> },
    ],
  },
];


