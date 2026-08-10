import { useEffect } from 'react';
import type { ReactElement } from 'react';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useSelector, useDispatch } from 'src/store';
import { logoutAction } from 'src/store/reducers/auth';

type GuardProps = {
  children: ReactElement | null;
};

/**
 * Shop pages require login.
 * - Logged in + online → stay (session persists, no repeat login)
 * - Not logged in → sign-in
 * - Offline → clear shop session and require sign-in
 */
const AuthGuard = ({ children }: GuardProps) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isLoggedIn } = useSelector((state) => state.auth);

  useEffect(() => {
    const forceShopLogin = () => {
      dispatch(logoutAction());
      try {
        localStorage.removeItem('persist:battleasia-shop');
      } catch {
        // ignore
      }
      router.replace(paths.auth.signIn);
    };

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      forceShopLogin();
      return undefined;
    }

    if (!isLoggedIn) {
      router.push(paths.auth.signIn);
      return undefined;
    }

    const onOffline = () => forceShopLogin();
    window.addEventListener('offline', onOffline);
    return () => window.removeEventListener('offline', onOffline);
  }, [isLoggedIn, dispatch, router]);

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return null;
  }

  if (!isLoggedIn) {
    return null;
  }

  return children;
};

export default AuthGuard;
