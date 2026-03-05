import { STORAGE_KEYS } from '@shared/lib/env';

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

type EnvMock = {
  POSITIONS_API_URL: string;
  MARKET_DATA_API_URL: string;
  ANALYTICS_API_URL: string;
  NEWS_API_URL: string;
  POSITIONS_WS_URL?: string;
};

function setWindowOrigin(origin: string) {
  Object.defineProperty(window, 'location', {
    value: { origin },
    writable: true,
  });
}

async function loadSocketModule(env: Partial<EnvMock> = {}) {
  jest.resetModules();

  const baseEnv: EnvMock = {
    POSITIONS_API_URL: 'http://localhost:8080',
    MARKET_DATA_API_URL: 'http://localhost:8081',
    ANALYTICS_API_URL: 'http://localhost:8082',
    NEWS_API_URL: 'http://localhost:8083',
    POSITIONS_WS_URL: 'http://localhost:8080',
  };

  const mergedEnv: EnvMock = { ...baseEnv, ...env };

  jest.doMock('./env', () => ({
    __esModule: true,
    ENV: mergedEnv,
    STORAGE_KEYS: {
      TOKEN: 'ww_token',
      USER: 'ww_user',
    },
  }));

  const mod = await import('./socket');
  mod.__resetSocketModuleForTests();
  return mod;
}

describe('socket', () => {
  beforeEach(() => {
    localStorage.clear();
    setWindowOrigin('http://localhost:5173');
  });

  it('creates a socket once and reuses it', async () => {
    const socketMod = await loadSocketModule();

    const fake = makeFakeSocket();
    const io = jest.fn(() => fake as unknown);

    socketMod.__setIoForTests(io as unknown as (...args: unknown[]) => unknown);

    const s1 = socketMod.getSocket();
    const s2 = socketMod.getSocket();

    expect(s1).toBe(s2);
    expect(io).toHaveBeenCalledTimes(1);
  });

  it('passes auth token and userId to socket.io', async () => {
    const socketMod = await loadSocketModule();

    const fake = makeFakeSocket();
    const io = jest.fn(() => fake as unknown);

    socketMod.__setIoForTests(io as unknown as (...args: unknown[]) => unknown);

    localStorage.setItem(STORAGE_KEYS.TOKEN, 'token-123');
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify({ id: 99 }));

    socketMod.getSocket();

    expect(io).toHaveBeenCalledTimes(1);

    const calls = io.mock.calls as unknown as IoCall[];
    const url = calls[0]?.[0];
    const opts = calls[0]?.[1];

    expect(url).toBe('http://localhost:8080');
    expect(opts?.auth).toEqual({ token: 'token-123', userId: 99 });
    expect(opts?.transports).toEqual(['websocket']);
  });

  it('resetSocket disconnects and allows a new instance', async () => {
    const socketMod = await loadSocketModule();

    const fake1 = makeFakeSocket();
    const fake2 = makeFakeSocket();

    const io = jest
      .fn()
      .mockImplementationOnce(() => fake1 as unknown)
      .mockImplementationOnce(() => fake2 as unknown);

    socketMod.__setIoForTests(io as unknown as (...args: unknown[]) => unknown);

    const s1 = socketMod.getSocket();
    socketMod.resetSocket();
    const s2 = socketMod.getSocket();

    expect(fake1.disconnect).toHaveBeenCalledTimes(1);
    expect(s1).not.toBe(s2);
    expect(io).toHaveBeenCalledTimes(2);
  });

  it('defaults to window.location.origin when POSITIONS_WS_URL is not set', async () => {
    const socketMod = await loadSocketModule({ POSITIONS_WS_URL: undefined });

    const fake = makeFakeSocket();
    const io = jest.fn(() => fake as unknown);

    socketMod.__setIoForTests(io as unknown as (...args: unknown[]) => unknown);

    socketMod.getSocket();

    const calls = io.mock.calls as unknown as IoCall[];
    const url = calls[0]?.[0];

    expect(url).toBe('http://localhost:5173');
  });

  it('uses POSITIONS_WS_URL when provided', async () => {
    const socketMod = await loadSocketModule({ POSITIONS_WS_URL: 'http://localhost:9999' });

    const fake = makeFakeSocket();
    const io = jest.fn(() => fake as unknown);

    socketMod.__setIoForTests(io as unknown as (...args: unknown[]) => unknown);

    socketMod.getSocket();

    const calls = io.mock.calls as unknown as IoCall[];
    const url = calls[0]?.[0];

    expect(url).toBe('http://localhost:9999');
  });
});