import { io as realIo, type Socket } from 'socket.io-client';
import { ENV, STORAGE_KEYS } from '@shared/lib/env';

let socket: Socket | null = null;

type StoredUser = { id: number } | null;

export type SocketIoOptions = {
  transports: string[];
  auth: { token: string | null; userId: number | undefined };
};

type IoFn = (url: string, opts: SocketIoOptions) => Socket;
type IoFnForTests = (url: string, opts: SocketIoOptions) => unknown;

let ioFn: IoFn | IoFnForTests = realIo;

function safeParseUser(json: string | null): StoredUser {
  if (!json) return null;
  try {
    return JSON.parse(json) as { id: number };
  } catch {
    return null;
  }
}

function resolveSocketUrl(): string {
  const wsUrl = ENV.POSITIONS_WS_URL?.trim();
  if (wsUrl) return wsUrl;

  return window.location.origin;
}

export function getSocket(): Socket {
  if (socket) return socket;

  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  const user = safeParseUser(localStorage.getItem(STORAGE_KEYS.USER));
  const userId = user?.id;

  socket = (ioFn as IoFn)(resolveSocketUrl(), {
    transports: ['websocket'],
    auth: { token, userId },
  });

  socket.on('connect', () => {
    if (userId) socket?.emit('join', userId);
  });

  return socket;
}

export function resetSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function __setIoForTests(next: IoFnForTests): void {
  ioFn = next;
}

export function __resetSocketModuleForTests(): void {
  resetSocket();
  ioFn = realIo;
}
