import { useEffect } from 'react';
import type { ReactElement } from 'react';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useSelector, useDispatch } from 'src/store';

import { hasPendingAuthHandoff } from './auth-handoff';

type GuardProps = {
  children: ReactElement | null;
};

const AuthGuard = ({ children }: GuardProps) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isLoggedIn } = useSelector((state) => state.auth);
  const handoffPending = hasPendingAuthHandoff();

  useEffect(() => {
    if (!isLoggedIn && !handoffPending) {
      router.push(paths.auth.signIn);
    }
  }, [isLoggedIn, handoffPending, dispatch, router]);

  if (!isLoggedIn) {
    return null;
  }

  return children;
};

export default AuthGuard;
