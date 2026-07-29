import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import AuthGuard from 'src/utils/authguard';
import DashboardLayout from 'src/layouts/dashboard';
import { LoadingScreen } from 'src/components/loading-screen';

const CustomerSupportListPage = lazy(() => import('src/pages/customer-support/list'));
const CustomerSupportDetailPage = lazy(() => import('src/pages/customer-support/detail'));
const LiveChatSettingsPage = lazy(() => import('src/pages/customer-support/live-chat-settings'));
const MessagingProviderSettingsPage = lazy(() => import('src/pages/customer-support/messaging-provider-settings'));

export const customerSupportRoutes = [
  {
    path: 'customer-support',
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
      { path: 'list', element: <CustomerSupportListPage /> },
      { element: <CustomerSupportListPage />, index: true },
      { path: 'live-chat-settings', element: <LiveChatSettingsPage /> },
      { path: 'messaging-provider-settings', element: <MessagingProviderSettingsPage /> },
      { path: ':conversationId', element: <CustomerSupportDetailPage /> },
    ],
  },
];
