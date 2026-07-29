import type { ReactElement } from 'react';
import { useEffect } from 'react';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useSelector } from 'src/store';

type GuardProps = {
  children: ReactElement | null;
};

const AuthGuard = ({ children }: GuardProps) => {
  const router = useRouter();
  const { isLoggedIn } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace(paths.auth.signIn);
    }
  }, [isLoggedIn, router]);

  // Do not mount protected pages until authenticated — prevents 401 toast spam
  if (!isLoggedIn) {
    return null;
  }

  return children;
};

export default AuthGuard;
