import type { RouteObject } from 'react-router';

import { Outlet } from 'react-router';
import { lazy, Suspense } from 'react';

import { lazyRetry } from 'src/utils/lazy-retry';

import { DashboardLayout } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

import { usePathname } from '../hooks';

// ----------------------------------------------------------------------

const IndexPage = lazy(() => lazyRetry(() => import('src/pages/dashboard/home')));
const PublicProfilePage = lazy(() => lazyRetry(() => import('src/pages/dashboard/profile')));
// privacy policy
const PrivacyPolicyPage = lazy(() => lazyRetry(() => import('src/pages/privacy-policy')));
// terms and conditions
const TermsAndConditionsPage = lazy(() => lazyRetry(() => import('src/pages/terms-and-conditions')));
// ----------------------------------------------------------------------

function SuspenseOutlet() {
  const pathname = usePathname();
  return (
    <Suspense key={pathname} fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  );
}

const dashboardLayout = () => (
  <DashboardLayout>
    <SuspenseOutlet />
  </DashboardLayout>
);

export const dashboardRoutes: RouteObject[] = [
  {
    path: 'dashboard',
    element: dashboardLayout(),
    children: [
      { element: <IndexPage />, index: true },
    ],
  },
  // privacy policy
  {
    path: 'privacy-policy',
    element: dashboardLayout(),
    children: [
      { element: <PrivacyPolicyPage />, index: true },
    ],
  },
  // terms and conditions
  {
    path: 'terms-and-conditions',
    element: dashboardLayout(),
    children: [
      { element: <TermsAndConditionsPage />, index: true },
    ],
  },
  {
    path: 'profile/:userId',
    element: dashboardLayout(),
    children: [
      { element: <PublicProfilePage />, index: true },
    ],
  },
];
