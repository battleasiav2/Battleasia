import type { Socket } from 'socket.io-client';
import { readAccessToken } from './auth';

type IoFn = typeof import('socket.io-client').io;

let ioLoader: Promise<IoFn> | null = null;
let socket: Socket | null = null;
let connecting: Promise<Socket | null> | null = null;

function loadIo() {
  if (!ioLoader) ioLoader = import('socket.io-client').then((m) => m.io);
  return ioLoader;
}

function socketPath() {
  return import.meta.env.PROD ? '/api/socket.io' : '/socket.io';
}

export async function getAuthedSocket(): Promise<Socket | null> {
  if (socket?.connected) return socket;
  if (connecting) return connecting;
  connecting = (async () => {
    try {
      const io = await loadIo();
      const token = readAccessToken() || '';
      socket = io(window.location.origin, {
        path: socketPath(),
        transports: ['websocket', 'polling'],
        auth: { token },
        withCredentials: true,
      });
      await new Promise<void>((resolve, reject) => {
        const t = window.setTimeout(() => reject(new Error('socket timeout')), 8000);
        socket!.once('connect', () => {
          window.clearTimeout(t);
          resolve();
        });
        socket!.once('connect_error', () => {
          window.clearTimeout(t);
          reject(new Error('socket auth failed'));
        });
      });
      return socket;
    } catch {
      socket?.disconnect();
      socket = null;
      return null;
    } finally {
      connecting = null;
    }
  })();
  return connecting;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
