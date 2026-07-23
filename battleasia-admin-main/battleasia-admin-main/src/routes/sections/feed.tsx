import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import AuthGuard from 'src/utils/authguard';
import DashboardLayout from 'src/layouts/dashboard';
import { LoadingScreen } from 'src/components/loading-screen';

const FeedListPage = lazy(() => import('src/pages/feed/list'));
const FeedCategoriesPage = lazy(() => import('src/pages/feed/categories'));

export const feedRoutes = [
  {
    path: 'feed',
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
      { path: 'list', element: <FeedListPage /> },
      { element: <FeedListPage />, index: true },
      { path: 'categories', element: <FeedCategoriesPage /> },
    ],
  },
];

