// components
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import useApi from 'src/hooks/use-api';

import { useSelector, useDispatch } from 'src/store';
import { userAction, balanceAction } from 'src/store/reducers/auth';


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
    try {
      if (isLoggedIn) {
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
        dispatch(userAction(res.data.user));
        dispatch(balanceAction(res.data.user.balance as number));
      }
    } catch (error) {
      console.error('Error during user initialization:', error);
    } finally {
      await new Promise((resolve) => setTimeout(resolve, 100));
      setLoading(false);
    }
  };

  useEffect(() => {
    const failSafe = setTimeout(() => setLoading(false), 12000);
    getMe().finally(() => clearTimeout(failSafe));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
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
  return children;
}
