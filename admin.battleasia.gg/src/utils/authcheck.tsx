// components
import { useEffect, useState } from 'react';
import { LoadingScreen } from 'src/components/loading-screen';
import useApi from 'src/hooks/use-api';
import { store, useDispatch, type RootState } from 'src/store';
import { balanceAction, loginAction, logoutAction, userAction } from 'src/store/reducers/auth';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export function AuthConsumer({ children }: Props) {
  const dispatch = useDispatch();
  const { initialize } = useApi();

  const [loading, setLoading] = useState<boolean>(true);

  const getMe = async () => {
    try {
      const { auth } = store.getState() as unknown as RootState;

      if (!auth.token && !auth.isLoggedIn) {
        return;
      }

      const res = await initialize();
      const user = res?.data?.user;

      if (!user) {
        if (auth.isLoggedIn || auth.token) {
          dispatch(logoutAction());
        }
        return;
      }

      dispatch(userAction(user));
      dispatch(balanceAction(user.balance as number));

      if (!auth.isLoggedIn && auth.token) {
        dispatch(
          loginAction({
            user,
            session: { accessToken: auth.token },
            balance: { balance: user.balance ?? 0 },
          } as any)
        );
      }
    } catch (error: any) {
      if (error?.response?.status === 401) {
        dispatch(logoutAction());
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMe();
    // eslint-disable-next-line
  }, []);

  if (loading) return <LoadingScreen />;
  return children;
}
