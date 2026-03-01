const ENV_KEYS = [
  'VITE_POSITIONS_API_URL',
  'VITE_MARKET_DATA_API_URL',
  'VITE_ANALYTICS_API_URL',
  'VITE_NEWS_API_URL',
  'VITE_POSITIONS_WS_URL',
] as const

function clearEnv(): void {
  globalThis.__VITE_ENV__ = undefined
  for (const k of ENV_KEYS) {
    delete (process.env as Record<string, string | undefined>)[k]
  }
}

describe('ENV', () => {
  beforeEach(() => {
    jest.resetModules()
    clearEnv()
  })

  afterEach(() => {
    clearEnv()
  })

  it('reads required vars from injected __VITE_ENV__', async () => {
    globalThis.__VITE_ENV__ = {
      VITE_POSITIONS_API_URL: 'http://localhost:3000/api',
      VITE_MARKET_DATA_API_URL: 'http://localhost:5000/api',
      VITE_ANALYTICS_API_URL: 'http://localhost:7000/api',
      VITE_NEWS_API_URL: 'http://localhost:6500/api',
      VITE_POSITIONS_WS_URL: 'ws://localhost:3000',
    }

    const mod = await import('./env')
    expect(mod.ENV.POSITIONS_API_URL).toContain('http://localhost:3000')
    expect(mod.ENV.POSITIONS_WS_URL).toBe('ws://localhost:3000')
  })

  it('throws a helpful error when a required var is missing', async () => {
    clearEnv()

    globalThis.__VITE_ENV__ = {
      VITE_POSITIONS_API_URL: 'http://localhost:3000/api',
      VITE_MARKET_DATA_API_URL: 'http://localhost:5000/api',
      VITE_ANALYTICS_API_URL: 'http://localhost:7000/api',
      // intentionally missing VITE_NEWS_API_URL
    }

    await expect(import('./env')).rejects.toThrow(/Missing required env var: VITE_NEWS_API_URL/)
  })
})