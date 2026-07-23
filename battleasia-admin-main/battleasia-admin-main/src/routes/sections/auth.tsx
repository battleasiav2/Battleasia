import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
// layouts
import AuthClassicLayout from 'src/layouts/auth/classic';
// components
import { LoadingScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

// JWT
const LoginPage = lazy(() => import('src/pages/auth/login'));

// ----------------------------------------------------------------------

export const authRoutes = [{
  path: 'auth',
  element: (
    <Suspense fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  ),
  children: [
    {
      path: 'login',
      element: (
        <AuthClassicLayout title='BattleAsia Admin'>
          <LoginPage />
        </AuthClassicLayout>
      ),
    },
  ],
}];

