import type { RouteObject } from 'react-router';

import { Outlet } from 'react-router';
import { lazy, Suspense } from 'react';

import { lazyRetry } from 'src/utils/lazy-retry';

import { AuthSplitLayout } from 'src/layouts/auth-split';



// ----------------------------------------------------------------------

/** **************************************
 * Jwt
 *************************************** */
const Auth = {
  SignInPage: lazy(() => lazyRetry(() => import('src/pages/auth/sign-in'))),
  SignUpPage: lazy(() => lazyRetry(() => import('src/pages/auth/sign-up'))),
  ForgotPasswordPage: lazy(() => lazyRetry(() => import('src/pages/auth/forgot-password'))),
  ResetPasswordPage: lazy(() => lazyRetry(() => import('src/pages/auth/reset-password'))),
  EmailVerificationPage: lazy(() => lazyRetry(() => import('src/pages/auth/email-verification'))),
};

export const authRoutes: RouteObject[] = [
  {
    path: 'auth',
    element: (
      <Suspense >
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
      {
        path: 'forgot-password',
        element: (
          <AuthSplitLayout>
            <Auth.ForgotPasswordPage />
          </AuthSplitLayout>
        ),
      },
      {
        path: 'reset-password',
        element: (
          <AuthSplitLayout>
            <Auth.ResetPasswordPage />
          </AuthSplitLayout>
        ),
      },
      {
        path: 'email-verification',
        element: (
          <AuthSplitLayout>
            <Auth.EmailVerificationPage />
          </AuthSplitLayout>
        ),
      },
    ],
  },
];
