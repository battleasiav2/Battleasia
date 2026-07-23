import React, { useRef, useMemo, useState, useEffect, useContext, createContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { balanceAction } from 'src/store/reducers/auth';
import { toast } from 'react-hot-toast';
import { CONFIG } from 'src/global-config';

interface SocketContextValue {
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue>({
  isConnected: false,
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const dispatch = useDispatch();
  const accessToken = useSelector((state: any) => state.auth.token);
  const userId = useSelector((state: any) => state.auth.user?._id);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const connectingRef = useRef(false);

  useEffect(() => {
    if (!accessToken || !userId) {
      // Disconnect if no credentials
      if (socketRef.current) {
        console.log('[Socket] Disconnecting (no credentials)...');
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return undefined;
    }

    // Prevent duplicate connections (especially from StrictMode double-mount)
    if (socketRef.current || connectingRef.current) return undefined;

    let cancelled = false;
    connectingRef.current = true;

    const connectSocket = async () => {
      try {
        // Dynamically import socket.io-client only when needed
        const { io } = await import('socket.io-client');

        // After async import, check if this effect was cleaned up
        if (cancelled) return;

        console.log('[Socket] Connecting to:', CONFIG.serverUrl);

        const socket = io(CONFIG.serverUrl, {
          auth: {
            token: accessToken,
          },
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5,
        });

        socket.on('connect', () => {
          setIsConnected(true);
        });

        socket.on('disconnect', (reason: string) => {
          setIsConnected(false);
        });

        socket.on('connect_error', (error: Error) => {
          setIsConnected(false);
        });

        // Listen for balance updates
        socket.on('balance-updated', (data: { balance: number; added: number; previousBalance: number }) => {
          dispatch(balanceAction(data.balance));

          // Show appropriate message based on whether balance increased or decreased
          if (data.added > 0) {
            toast.success(`Your balance has been updated! +${data.added.toFixed(2)} coins added`, {
              duration: 5000,
              icon: '💰',
            });
          } else if (data.added < 0) {
            toast(`Your withdrawal has been approved! ${data.added.toFixed(2)} coins deducted`, {
              duration: 5000,
              icon: '✅',
            });
          } else {
            toast(`Your balance has been updated!`, {
              duration: 5000,
              icon: '💰',
            });
          }
        });

        socketRef.current = socket;
      } catch (error) {
        console.error('❌ [Socket] Failed to load socket.io-client:', error);
        // Retry connection after 5 seconds
        if (!cancelled) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connectingRef.current = false;
            connectSocket();
          }, 5000);
        }
      } finally {
        connectingRef.current = false;
      }
    };

    connectSocket();

    return () => {
      cancelled = true;
      connectingRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        console.log('[Socket] Disconnecting (cleanup)...');
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
    };
  }, [accessToken, userId, dispatch]);

  const value = useMemo(
    () => ({
      isConnected,
    }),
    [isConnected]
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}
