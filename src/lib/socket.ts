// lib/socket.ts
/*
    Client only socket singleton
*/
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket() {
  // guard and prevent server side rendering (ssr)
  if (typeof window === 'undefined') return null;

  if (!socket) {
    const url =
      `${process.env.NEXT_PUBLIC_SOCKET_BASE_URL}:${process.env.NEXT_PUBLIC_SOCKET_PORT}`!;
    socket = io(url, {
      // Let socket.io fall back to polling if WS fails locally/proxied
      transports: ['websocket', 'polling'],
      withCredentials: false,
      // path: '/socket.io', // uncomment if you changed server path
    });

    // helpful logs
    socket.on('connect', () => {
      console.log('[socket] connected', socket?.id);
    });
    socket.on('connect_error', (err) => {
      console.error('[socket] connect_error', err?.message, err);
    });
    socket.on('disconnect', (reason) => {
      console.log('[socket] disconnected:', reason);
    });
  }
  return socket;
}
