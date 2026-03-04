import { quoteState } from './quotes';

describe('portfolio/utils/quotes', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-03-04T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns missing when quote is absent', () => {
    expect(quoteState(undefined)).toEqual({
      state: 'missing',
      tip: 'Live price not available yet',
    });
  });

  it('returns missing when currentPrice is not finite', () => {
    const out = quoteState({
      symbol: 'AAPL',
      currentPrice: Number.NaN,
      dailyChangePercent: 0,
      logoUrl: '',
      updatedAt: '',
    });
    expect(out.state).toBe('missing');
  });

  it('returns fresh when price exists and updatedAt is recent', () => {
    const out = quoteState({
      symbol: 'AAPL',
      currentPrice: 100,
      dailyChangePercent: 1,
      logoUrl: '',
      updatedAt: '2026-03-04T11:59:45.000Z',
    });
    expect(out.state).toBe('fresh');
    expect(out.tip).toMatch(/Updated/i);
  });

  it('returns stale when updatedAt exceeds threshold', () => {
    const out = quoteState({
      symbol: 'AAPL',
      currentPrice: 100,
      dailyChangePercent: 1,
      logoUrl: '',
      updatedAt: '2026-03-04T11:58:00.000Z',
    });
    expect(out.state).toBe('stale');
    expect(out.tip).toMatch(/Updated/i);
  });
});
