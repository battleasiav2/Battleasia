import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  pendingDepositsCount: number;
  pendingWithdrawalsCount: number;
  refreshPendingCount: () => void;
  refreshPendingWithdrawalsCount: () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  pendingDepositsCount: 0,
  pendingWithdrawalsCount: 0,
  refreshPendingCount: () => {},
  refreshPendingWithdrawalsCount: () => {},
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: ReactNode;
}

const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [pendingDepositsCount, setPendingDepositsCount] = useState(0);
  const [pendingWithdrawalsCount, setPendingWithdrawalsCount] = useState(0);

  const accessToken = useSelector((state: any) => state.auth.token);
  const user = useSelector((state: any) => state.auth.user);

  // Function to manually refresh pending deposits count from API
  const refreshPendingCount = useCallback(async () => {
    if (!accessToken) return;

    try {
      const response = await fetch(`${SOCKET_URL}/api/v4/payments/deposit-history/statistics`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const result = await response.json();
      if (result.status && result.data) {
        setPendingDepositsCount(result.data.pending || 0);
      }
    } catch (error) {
      console.error('[Socket] Failed to fetch pending deposits count:', error);
    }
  }, [accessToken]);

  // Function to manually refresh pending withdrawals count from API
  const refreshPendingWithdrawalsCount = useCallback(async () => {
    if (!accessToken) return;

    try {
      const response = await fetch(`${SOCKET_URL}/api/v4/payments/withdrawal-history/stats`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const result = await response.json();
      if (result.status && result.data) {
        setPendingWithdrawalsCount(result.data.pending?.count || 0);
      }
    } catch (error) {
      console.error('[Socket] Failed to fetch pending withdrawals count:', error);
    }
  }, [accessToken]);

  // Initialize socket connection
  useEffect(() => {
    if (!accessToken) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return undefined;
    }

    const newSocket = io(SOCKET_URL, {
      auth: {
        token: `Bearer ${accessToken}`,
      },
      transports: ['websocket', 'polling'],
      path: '/socket.io/',
    });

    newSocket.on('connect', () => {
      console.log('[Socket] Connected to server');
      setIsConnected(true);
      
      // Join admin room to receive deposit notifications
      // Admin users have role object with name property (e.g., role.name === 'admin' or 'agent')
      const isAdminUser = user?.role?.name || user?.role === 'admin' || user?.isAdmin;
      if (isAdminUser) {
        newSocket.emit('join-admin-room');
        console.log('[Socket] Joined admin room for user:', user?.username);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('[Socket] Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error);
      setIsConnected(false);
    });

    // Listen for new deposit notifications
    newSocket.on('new-deposit', (data) => {
      console.log('[Socket] New deposit received:', data);
      console.log('[Socket] Current pending count before increment:', pendingDepositsCount);
      // Update pending count
      setPendingDepositsCount((prev) => {
        const newCount = prev + 1;
        console.log('[Socket] Updated pending count:', newCount);
        return newCount;
      });
    });

    // Listen for pending deposits count updates
    newSocket.on('pending-deposits-count', (data) => {
      console.log('[Socket] Pending deposits count updated from server:', data.count);
      setPendingDepositsCount(data.count);
    });

    // Listen for new withdrawal notifications
    newSocket.on('new-withdrawal', (data) => {
      console.log('[Socket] New withdrawal received:', data);
      console.log('[Socket] Current pending withdrawals count before increment:', pendingWithdrawalsCount);
      // Update pending count
      setPendingWithdrawalsCount((prev) => {
        const newCount = prev + 1;
        console.log('[Socket] Updated pending withdrawals count:', newCount);
        return newCount;
      });
    });

    // Listen for pending withdrawals count updates
    newSocket.on('pending-withdrawals-count', (data) => {
      console.log('[Socket] Pending withdrawals count updated from server:', data.count);
      setPendingWithdrawalsCount(data.count);
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.emit('leave-admin-room');
        newSocket.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, user]);

  // Fetch initial pending counts
  useEffect(() => {
    const isAdminUser = user?.role?.name || user?.role === 'admin' || user?.isAdmin;
    if (accessToken && isAdminUser) {
      refreshPendingCount();
      refreshPendingWithdrawalsCount();
    }
  }, [accessToken, user, refreshPendingCount, refreshPendingWithdrawalsCount]);

  const value: SocketContextType = useMemo(
    () => ({
      socket,
      isConnected,
      pendingDepositsCount,
      pendingWithdrawalsCount,
      refreshPendingCount,
      refreshPendingWithdrawalsCount,
    }),
    [socket, isConnected, pendingDepositsCount, pendingWithdrawalsCount, refreshPendingCount, refreshPendingWithdrawalsCount]
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
