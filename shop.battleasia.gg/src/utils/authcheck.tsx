// components
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import axios from 'src/lib/axios';
import useApi from 'src/hooks/use-api';

import { store, useSelector, useDispatch } from 'src/store';
import { loginAction, userAction, balanceAction } from 'src/store/reducers/auth';

import { consumeAuthHandoffToken, hasPendingAuthHandoff } from './auth-handoff';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

function BootSplash() {
  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 20000,
        bgcolor: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CircularProgress size={40} sx={{ color: '#f5c518' }} />
    </Box>
  );
}

/**
 * Keep the route tree mounted while auth initializes.
 * Swapping spinner ↔ children caused removeChild DOM races with portals/motion.
 *
 * Also consumes main-app → shop SSO handoff (`#ba_handoff=<jwt>`) before AuthGuard runs.
 */
export function AuthConsumer({ children }: Props) {
  const dispatch = useDispatch();
  const { initialize } = useApi();
  const { isLoggedIn } = useSelector((storeState) => storeState.auth);

  const [loading, setLoading] = useState(true);
  /** Block children (and AuthGuard) until handoff is attempted when hash is present */
  const [bootstrapped, setBootstrapped] = useState(() => !hasPendingAuthHandoff());

  useEffect(() => {
    let cancelled = false;

    const applyHandoff = async () => {
      const token = consumeAuthHandoffToken();
      if (!token) return;

      const res = await axios.get('api/v2/users/me', {
        headers: { authorization: `Bearer ${token}` },
      });
      const user = res.data?.user ?? res.data?.data ?? res.data;
      if (!user || (typeof user !== 'object')) {
        throw new Error('Invalid handoff profile');
      }

      dispatch(
        loginAction({
          user,
          session: { accessToken: token },
          balance: { balance: typeof (user as { balance?: number }).balance === 'number' ? (user as { balance: number }).balance : 0 },
        })
      );
    };

    const getMe = async () => {
      try {
        await applyHandoff();

        const loggedIn = store.getState().auth.isLoggedIn || isLoggedIn;
        if (loggedIn) {
          const res = await Promise.race([
            initialize(),
            new Promise<null>((_, reject) => {
              setTimeout(() => reject(new Error('Auth initialize timeout')), 10000);
            }),
          ]);
          if (!res?.data) {
            console.error('Failed to initialize user data');
            return;
          }
          const user = res.data.user ?? res.data;
          dispatch(userAction(user));
          if (typeof user?.balance === 'number') {
            dispatch(balanceAction(user.balance));
          }
        }
      } catch (error) {
        console.error('Error during user initialization:', error);
      } finally {
        if (!cancelled) {
          setBootstrapped(true);
          setLoading(false);
        }
      }
    };

    const failSafe = setTimeout(() => {
      if (!cancelled) {
        setBootstrapped(true);
        setLoading(false);
      }
    }, 12000);

    getMe().finally(() => clearTimeout(failSafe));

    return () => {
      cancelled = true;
      clearTimeout(failSafe);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!bootstrapped) {
    return <BootSplash />;
  }

  return (
    <>
      {children}
      {loading ? <BootSplash /> : null}
    </>
  );
}
