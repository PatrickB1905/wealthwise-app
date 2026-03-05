type ViteEnvKey =
  | 'VITE_POSITIONS_API_URL'
  | 'VITE_MARKET_DATA_API_URL'
  | 'VITE_ANALYTICS_API_URL'
  | 'VITE_NEWS_API_URL'
  | 'VITE_POSITIONS_WS_URL';

type ViteEnvShape = Partial<Record<ViteEnvKey, string>> & { MODE?: string };

function setViteEnv(next: ViteEnvShape | undefined) {
  if (next) {
    (globalThis as unknown as { __VITE_ENV__?: ViteEnvShape }).__VITE_ENV__ = next;
  } else {
    delete (globalThis as unknown as { __VITE_ENV__?: ViteEnvShape }).__VITE_ENV__;
  }
}

async function importFreshEnvModule() {
  jest.resetModules();
  return import('./env');
}

describe('shared/lib/env', () => {
  afterEach(() => {
    setViteEnv(undefined);
    jest.resetModules();
  });

  it('uses same-origin API defaults when VITE_* variables are not set', async () => {
    setViteEnv({});

    const { ENV } = await importFreshEnvModule();

    expect(ENV.POSITIONS_API_URL).toBe('/api/positions');
    expect(ENV.MARKET_DATA_API_URL).toBe('/api/market-data');
    expect(ENV.ANALYTICS_API_URL).toBe('/api/analytics');
    expect(ENV.NEWS_API_URL).toBe('/api/news');
    expect(ENV.POSITIONS_WS_URL).toBeUndefined();
  });

  it('respects explicit VITE_* overrides when provided', async () => {
    setViteEnv({
      VITE_POSITIONS_API_URL: 'http://localhost:4000/api',
      VITE_MARKET_DATA_API_URL: 'http://localhost:5000/api',
      VITE_ANALYTICS_API_URL: 'http://localhost:7000/api',
      VITE_NEWS_API_URL: 'http://localhost:6500/api',
      VITE_POSITIONS_WS_URL: 'http://localhost:4000',
    });

    const { ENV } = await importFreshEnvModule();

    expect(ENV.POSITIONS_API_URL).toBe('http://localhost:4000/api');
    expect(ENV.MARKET_DATA_API_URL).toBe('http://localhost:5000/api');
    expect(ENV.ANALYTICS_API_URL).toBe('http://localhost:7000/api');
    expect(ENV.NEWS_API_URL).toBe('http://localhost:6500/api');
    expect(ENV.POSITIONS_WS_URL).toBe('http://localhost:4000');
  });

  it('trims values and falls back when values are empty', async () => {
    setViteEnv({
      VITE_POSITIONS_API_URL: '   ',
      VITE_NEWS_API_URL: '  /api/news  ',
    });

    const { ENV } = await importFreshEnvModule();

    expect(ENV.POSITIONS_API_URL).toBe('/api/positions');
    expect(ENV.NEWS_API_URL).toBe('/api/news');
  });
});