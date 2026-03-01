describe('API clients', () => {
  beforeEach(() => {
    jest.resetModules()

    globalThis.__VITE_ENV__ = {
      VITE_POSITIONS_API_URL: 'http://localhost:3000/api',
      VITE_MARKET_DATA_API_URL: 'http://localhost:5000/api',
      VITE_ANALYTICS_API_URL: 'http://localhost:7000/api',
      VITE_NEWS_API_URL: 'http://localhost:6500/api',
    }
  })

  it('constructs clients with correct base URLs', async () => {
    const createHttpClientMock = jest.fn<unknown, [string]>(() => ({ mocked: true }))

    jest.doMock('./http', () => ({
      __esModule: true,
      createHttpClient: (baseURL: string) => createHttpClientMock(baseURL),
    }))

    const API = (await import('./axios')).default
    const AnalyticsAPI = (await import('./analyticsClient')).default
    const NewsAPI = (await import('./newsClient')).default
    const MarketDataAPI = (await import('./marketData')).default

    expect(API).toEqual({ mocked: true })
    expect(AnalyticsAPI).toEqual({ mocked: true })
    expect(NewsAPI).toEqual({ mocked: true })
    expect(MarketDataAPI).toEqual({ mocked: true })

    expect(createHttpClientMock).toHaveBeenCalledWith('http://localhost:3000/api')
    expect(createHttpClientMock).toHaveBeenCalledWith('http://localhost:7000/api')
    expect(createHttpClientMock).toHaveBeenCalledWith('http://localhost:6500/api')
    expect(createHttpClientMock).toHaveBeenCalledWith('http://localhost:5000/api')
  })
})