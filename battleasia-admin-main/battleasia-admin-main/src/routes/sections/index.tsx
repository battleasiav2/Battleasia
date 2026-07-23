import { lazy, Suspense } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
// config
import { PATH_AFTER_LOGIN } from 'src/config-global';
// auth
import AuthGuard from 'src/utils/authguard';
// layouts
import DashboardLayout from 'src/layouts/dashboard';
// components
import { LoadingScreen } from 'src/components/loading-screen';
//
import { mainRoutes } from './main';

import { authRoutes } from './auth';
import { dashboardRoutes } from './dashboard';
import { usersRoutes } from './users';
import { gamesRoutes } from './games';
import { balanceRoutes } from './balance';
import { paymentsRoutes } from './payments';
import { notificationsRoutes } from './notifications';
import { feedRoutes } from './feed';
import { customerSupportRoutes } from './customer-support';
import { shopRoutes } from './shop';

// Profile page
const ProfilePage = lazy(() => import('src/pages/profile'));

// ----------------------------------------------------------------------

export default function Router() {
  return useRoutes([
    {
      path: '/',
      element: <Navigate to={PATH_AFTER_LOGIN} replace />,
    },

    // Auth routes
    ...authRoutes,

    // Profile route
    {
      path: 'profile',
      element: (
        <AuthGuard>
          <DashboardLayout>
            <Suspense fallback={<LoadingScreen />}>
              <ProfilePage />
            </Suspense>
          </DashboardLayout>
        </AuthGuard>
      ),
    },

    // Dashboard routes
    ...dashboardRoutes,

    // Users routes
    ...usersRoutes,

    // Games routes
    ...gamesRoutes,

    // Balance routes
    ...balanceRoutes,

    // Payments routes
    ...paymentsRoutes,

    // Notifications routes
    ...notificationsRoutes,

    // Feed routes
    ...feedRoutes,

    // Customer Support routes
    ...customerSupportRoutes,

    // Main routes
    ...mainRoutes,

    // Shop routes
    ...shopRoutes,

    // No match 404
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}
