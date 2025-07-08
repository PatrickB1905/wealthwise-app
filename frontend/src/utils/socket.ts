import { io, type Socket } from 'socket.io-client';

const WS_URL = 'http://localhost:4000';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const token    = localStorage.getItem('ww_token');
    const userJson = localStorage.getItem('ww_user');
    const userId   = userJson ? JSON.parse(userJson).id : undefined;

    socket = io(WS_URL, {
      auth: { token, userId },
    });
    if (userId) socket.emit('join', userId);
  }
  return socket;
}