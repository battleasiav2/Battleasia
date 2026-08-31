import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import AuthGuard from 'src/utils/authguard';
import DashboardLayout from 'src/layouts/dashboard';
import { LoadingScreen } from 'src/components/loading-screen';

const EngagementMissionsPage = lazy(() => import('src/pages/engagement/missions'));
const EngagementBadgesPage = lazy(() => import('src/pages/engagement/badges'));
const EngagementSettingsPage = lazy(() => import('src/pages/engagement/settings'));

export const engagementRoutes = [
  {
    path: 'engagement',
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
      { path: 'missions', element: <EngagementMissionsPage /> },
      { path: 'badges', element: <EngagementBadgesPage /> },
      { path: 'settings', element: <EngagementSettingsPage /> },
      { element: <EngagementMissionsPage />, index: true },
    ],
  },
];
