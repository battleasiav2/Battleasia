import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import AuthGuard from 'src/utils/authguard';
import DashboardLayout from 'src/layouts/dashboard';
import { LoadingScreen } from 'src/components/loading-screen';

const MailSettingsPage = lazy(() => import('src/pages/system/mail-settings'));
const AppDownloadPage = lazy(() => import('src/pages/system/app-download'));

export const systemRoutes = [
  {
    path: 'system',
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
      { element: <MailSettingsPage />, index: true },
      { path: 'mail-settings', element: <MailSettingsPage /> },
      { path: 'app-download', element: <AppDownloadPage /> },
    ],
  },
];
