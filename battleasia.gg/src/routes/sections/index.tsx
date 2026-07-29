import type { RouteObject } from 'react-router';

import { lazy } from 'react';
import { Navigate } from 'react-router';

import { CONFIG } from 'src/global-config';

import { authRoutes } from './auth';
import { userRoutes } from './user';
import { dashboardRoutes } from './dashboard';

// ----------------------------------------------------------------------

const Page404 = lazy(() => import('src/pages/error/404'));
const TermsPage = lazy(() => import('src/pages/terms-and-conditions'));
const PrivacyPage = lazy(() => import('src/pages/privacy-policy'));

export const routesSection: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to={CONFIG.auth.redirectPath} replace />,
  },

  { path: 'terms-and-conditions', element: <TermsPage /> },
  { path: 'privacy-policy', element: <PrivacyPage /> },

  // Auth
  ...authRoutes,

  // Dashboard
  ...dashboardRoutes,

  // User
  ...userRoutes,

  // No match
  { path: '*', element: <Page404 /> },
];
