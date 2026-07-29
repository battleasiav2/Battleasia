import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import AuthGuard from 'src/utils/authguard';
import DashboardLayout from 'src/layouts/dashboard';
import { LoadingScreen } from 'src/components/loading-screen';

const FeedListPage = lazy(() => import('src/pages/feed/list'));
const FeedCategoriesPage = lazy(() => import('src/pages/feed/categories'));
const ProfileSocialSettingsPage = lazy(() => import('src/pages/feed/profile-social-settings'));
const SocialReportsPage = lazy(() => import('src/pages/feed/social-reports'));
const ReelsModerationPage = lazy(() => import('src/pages/feed/reels-moderation'));

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
      { path: 'profile-social-settings', element: <ProfileSocialSettingsPage /> },
      { path: 'social-reports', element: <SocialReportsPage /> },
      { path: 'reels-moderation', element: <ReelsModerationPage /> },
    ],
  },
];

