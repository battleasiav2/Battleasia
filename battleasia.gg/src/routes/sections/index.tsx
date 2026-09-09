import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';
import { Navigate } from 'react-router';

import { CONFIG } from 'src/global-config';
import { LoadingScreen } from 'src/components/loading-screen';

import { authRoutes } from './auth';
import { userRoutes } from './user';
import { dashboardRoutes } from './dashboard';

// ----------------------------------------------------------------------

const Page404 = lazy(() => import('src/pages/error/404'));

export const routesSection: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to={CONFIG.auth.redirectPath} replace />,
  },

  // Auth
  ...authRoutes,

  // Dashboard
  ...dashboardRoutes,

  // User
  ...userRoutes,

  // No match
  {
    path: '*',
    element: (
      <Suspense fallback={<LoadingScreen />}>
        <Page404 />
      </Suspense>
    ),
  },
];
