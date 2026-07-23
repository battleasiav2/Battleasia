// components
import { useEffect, useState } from 'react';
import { LoadingScreen } from 'src/components/loading-screen';
import useApi from 'src/hooks/use-api';
import { useSelector, useDispatch } from 'src/store';
import { balanceAction, userAction } from 'src/store/reducers/auth';

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
    if (isLoggedIn) {
      const res = await initialize();
      if (!res?.data) return;
      dispatch(userAction(res.data.user));
      dispatch(balanceAction(res.data.user.balance as number));
    }
    setLoading(false);
  };

  useEffect(() => {
    getMe();
    // eslint-disable-next-line
  }, []);
  if (loading) return <LoadingScreen />;
  return children;
}
