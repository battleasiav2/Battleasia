import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
// auth
import AuthGuard from 'src/utils/authguard';
// layouts
import DashboardLayout from 'src/layouts/dashboard';
// components
import { LoadingScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

const UserListPage = lazy(() => import('src/pages/users/list'));
const UserRolePage = lazy(() => import('src/pages/users/role'));
const UserHistoryPage = lazy(() => import('src/pages/users/history'));
const UserOnlinePage = lazy(() => import('src/pages/users/online'));
const UserPremiumPage = lazy(() => import('src/pages/users/premium'));
const UserReferralSettingsPage = lazy(() => import('src/pages/users/referral-settings'));
const UserTransferSettingsPage = lazy(() => import('src/pages/users/transfer-settings'));
const UserReferralHistoryPage = lazy(() => import('src/pages/users/referral-history'));
// ----------------------------------------------------------------------

export const usersRoutes = [
  {
    path: 'users',
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
      { element: <UserListPage />, index: true },
      { path: 'list', element: <UserListPage /> },
      { path: 'role', element: <UserRolePage /> },
      { path: 'history', element: <UserHistoryPage /> },
      { path: 'online', element: <UserOnlinePage /> },
      { path: 'premium', element: <UserPremiumPage /> },
      { path: 'referral-settings', element: <UserReferralSettingsPage /> },
      { path: 'transfer-settings', element: <UserTransferSettingsPage /> },
      { path: 'referral-history', element: <UserReferralHistoryPage /> },
    ],
  },
];
