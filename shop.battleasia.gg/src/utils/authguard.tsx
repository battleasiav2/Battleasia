import { useEffect, useRef } from 'react';
import type { ReactElement } from 'react';

import axios from 'src/lib/axios';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useSelector, useDispatch } from 'src/store';
import { logoutAction } from 'src/store/reducers/auth';

import {
  clearShopPersistStorage,
  clearShopSession,
  hasShopSession,
} from './shop-session';

type GuardProps = {
  children: ReactElement | null;
};

/**
 * Shop pages require a fresh sign-in each browser session.
 * - No tab session → logout + sign-in (even if a cookie/token exists)
 * - Offline → logout + sign-in
 */
const AuthGuard = ({ children }: GuardProps) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isLoggedIn } = useSelector((state) => state.auth);
  const forcingLoginRef = useRef(false);

  useEffect(() => {
    const forceShopLogin = async () => {
      if (forcingLoginRef.current) return;
      forcingLoginRef.current = true;

      clearShopSession();
      try {
        await axios.post('api/v2/users/logout');
      } catch {
        // ignore — still clear client state
      }
      dispatch(logoutAction());
      clearShopPersistStorage();
      router.replace(paths.auth.signIn);
    };

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      void forceShopLogin();
      return undefined;
    }

    if (!hasShopSession()) {
      void forceShopLogin();
      return undefined;
    }

    if (!isLoggedIn) {
      router.replace(paths.auth.signIn);
      return undefined;
    }

    const onOffline = () => {
      void forceShopLogin();
    };
    window.addEventListener('offline', onOffline);
    return () => window.removeEventListener('offline', onOffline);
  }, [isLoggedIn, dispatch, router]);

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return null;
  }

  if (!hasShopSession() || !isLoggedIn) {
    return null;
  }

  return children;
};

export default AuthGuard;
