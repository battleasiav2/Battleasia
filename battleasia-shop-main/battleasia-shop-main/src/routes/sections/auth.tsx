import type { RouteObject } from 'react-router';

import { Outlet } from 'react-router';
import { lazy, Suspense } from 'react';

import { lazyRetry } from 'src/utils/lazy-retry';

import { AuthSplitLayout } from 'src/layouts/auth-split';

import { LoadingScreen } from 'src/components/loading-screen';


// ----------------------------------------------------------------------

/** **************************************
 * Jwt
 *************************************** */
const Auth = {
  SignInPage: lazy(() => lazyRetry(() => import('src/pages/auth/sign-in'))),
  SignUpPage: lazy(() => lazyRetry(() => import('src/pages/auth/sign-up'))),
};

export const authRoutes: RouteObject[] = [
  {
    path: 'auth',
    element: (
      <Suspense fallback={<LoadingScreen />}>
        <Outlet />
      </Suspense>
    ),
    children: [
      {
        path: 'sign-in',
        element: (
          <AuthSplitLayout >
            <Auth.SignInPage />
          </AuthSplitLayout>
        ),
      },
      {
        path: 'sign-up',
        element: (
          <AuthSplitLayout>
            <Auth.SignUpPage />
          </AuthSplitLayout>
        ),
      },
    ],
  },
];
