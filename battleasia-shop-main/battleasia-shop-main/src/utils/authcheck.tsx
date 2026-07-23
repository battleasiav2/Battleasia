// components
import { useState, useEffect } from 'react';

import useApi from 'src/hooks/use-api';

import { useSelector, useDispatch } from 'src/store';
import { userAction, balanceAction } from 'src/store/reducers/auth';

import { LoadingScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export function AuthConsumer({ children }: Props) {
  const dispatch = useDispatch();
  const { initialize } = useApi();
  const { isLoggedIn } = useSelector((store) => store.auth);

  const [loading, setLoading] = useState<boolean>(true);

  const getMe = async () => {
    // Set up temp user if not logged in
    if (isLoggedIn) {
      const res = await initialize();
      if (!res?.data) return;
      dispatch(userAction(res.data.user));
      dispatch(balanceAction(res.data.user.balance as number));
      setLoading(false);
      return;
    }
    setLoading(false);
  };

  useEffect(() => {
    getMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (loading) return <LoadingScreen />;
  return children;
}
