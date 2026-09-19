import type { Socket } from 'socket.io-client';
import { readAdminToken } from './api';

let ioLoader: Promise<typeof import('socket.io-client').io> | null = null;
let socket: Socket | null = null;

function loadIo() {
  if (!ioLoader) ioLoader = import('socket.io-client').then((m) => m.io);
  return ioLoader;
}

export async function getAdminSocket(): Promise<Socket | null> {
  if (socket?.connected) return socket;
  try {
    const io = await loadIo();
    const token = readAdminToken();
    socket = io(window.location.origin, {
      path: import.meta.env.PROD ? '/api/socket.io' : '/socket.io',
      transports: ['websocket', 'polling'],
      auth: { token },
      withCredentials: true,
    });
    await new Promise<void>((resolve, reject) => {
      const t = window.setTimeout(() => reject(new Error('timeout')), 8000);
      socket!.once('connect', () => {
        window.clearTimeout(t);
        resolve();
      });
      socket!.once('connect_error', () => {
        window.clearTimeout(t);
        reject(new Error('auth'));
      });
    });
    socket.emit('join-admin-room');
    return socket;
  } catch {
    socket?.disconnect();
    socket = null;
    return null;
  }
}

export function disconnectAdminSocket() {
  socket?.emit('leave-admin-room');
  socket?.disconnect();
  socket = null;
}
