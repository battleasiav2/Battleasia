import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
// auth
import AuthGuard from 'src/utils/authguard';
// layouts
import DashboardLayout from 'src/layouts/dashboard';
// components
import { LoadingScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

const DashboardHomePage = lazy(() => import('src/pages/dashboard/home'));
const UserListPage = lazy(() => import('src/pages/users/list'));
const UserRolePage = lazy(() => import('src/pages/users/role'));
const UserHistoryPage = lazy(() => import('src/pages/users/history'));
const UserOnlinePage = lazy(() => import('src/pages/users/online'));
const GameListPage = lazy(() => import('src/pages/games/list'));

// ----------------------------------------------------------------------

export const dashboardRoutes = [
  {
    path: 'dashboard',
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
      { element: <DashboardHomePage />, index: true },
      {
        path: 'users',
        children: [
          { element: <UserListPage />, index: true },
          { path: 'list', element: <UserListPage /> },
          { path: 'role', element: <UserRolePage /> },
          { path: 'history', element: <UserHistoryPage /> },
          { path: 'online', element: <UserOnlinePage /> },
        ],
      },
      {
        path: 'games',
        children: [
          { element: <GameListPage />, index: true },
          { path: 'list', element: <GameListPage /> },
        ],
      },
    ],
  },
];
