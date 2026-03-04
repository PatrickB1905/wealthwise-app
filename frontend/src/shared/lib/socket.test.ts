import { __resetSocketModuleForTests, __setIoForTests, getSocket, resetSocket } from './socket';
import { STORAGE_KEYS } from '@shared/lib/env';

jest.mock('./env', () => ({
  __esModule: true,
  ENV: {
    POSITIONS_API_URL: 'http://localhost:8080',
    MARKET_DATA_API_URL: 'http://localhost:8081',
    ANALYTICS_API_URL: 'http://localhost:8082',
    NEWS_API_URL: 'http://localhost:8083',
    POSITIONS_WS_URL: 'http://localhost:8080',
  },
  STORAGE_KEYS: {
    TOKEN: 'ww_token',
    USER: 'ww_user',
  },
}));

type FakeSocket = {
  on: jest.Mock;
  emit: jest.Mock;
  disconnect: jest.Mock;
};

function makeFakeSocket(): FakeSocket {
  return {
    on: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
  };
}

type IoOptions = {
  auth?: { token?: string; userId?: number };
  transports?: string[];
};

type IoCall = [string, IoOptions?];

describe('socket', () => {
  beforeEach(() => {
    localStorage.clear();
    __resetSocketModuleForTests();
  });

  it('creates a socket once and reuses it', () => {
    const fake = makeFakeSocket();

    const io = jest.fn(() => fake as unknown);
    __setIoForTests(io as unknown as (...args: unknown[]) => unknown);

    const s1 = getSocket();
    const s2 = getSocket();

    expect(s1).toBe(s2);
    expect(io).toHaveBeenCalledTimes(1);
  });

  it('passes auth token and userId to socket.io', () => {
    const fake = makeFakeSocket();

    const io = jest.fn(() => fake as unknown);
    __setIoForTests(io as unknown as (...args: unknown[]) => unknown);

    localStorage.setItem(STORAGE_KEYS.TOKEN, 'token-123');
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify({ id: 99 }));

    getSocket();

    expect(io).toHaveBeenCalledTimes(1);

    const calls = io.mock.calls as unknown as IoCall[];
    const opts = calls[0]?.[1];

    expect(opts?.auth).toEqual({ token: 'token-123', userId: 99 });
    expect(opts?.transports).toEqual(['websocket']);
  });

  it('resetSocket disconnects and allows a new instance', () => {
    const fake1 = makeFakeSocket();
    const fake2 = makeFakeSocket();

    const io = jest
      .fn()
      .mockImplementationOnce(() => fake1 as unknown)
      .mockImplementationOnce(() => fake2 as unknown);

    __setIoForTests(io as unknown as (...args: unknown[]) => unknown);

    const s1 = getSocket();
    resetSocket();
    const s2 = getSocket();

    expect(fake1.disconnect).toHaveBeenCalledTimes(1);
    expect(s1).not.toBe(s2);
    expect(io).toHaveBeenCalledTimes(2);
  });
});
