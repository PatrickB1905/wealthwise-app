jest.mock('../api/marketData', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))

jest.mock('../utils/socket', () => ({
  __esModule: true,
  getSocket: () => ({
    on: jest.fn(),
    off: jest.fn(),
  }),
}))

import { __private__ } from './useQuotes'

describe('useQuotes mergeQuoteUpdate', () => {
  it('keeps existing values when update is partial and sets updatedAt', () => {
    const old = {
      symbol: 'AAPL',
      currentPrice: 100,
      dailyChangePercent: 1,
      logoUrl: 'x',
      updatedAt: '2025-01-01T00:00:00.000Z',
    }

    const upd = {
      symbol: 'AAPL',
      currentPrice: 101,
    }

    const next = __private__.mergeQuoteUpdate(old, upd)

    expect(next.currentPrice).toBe(101)
    expect(next.dailyChangePercent).toBe(1)
    expect(next.logoUrl).toBe('x')
    expect(typeof next.updatedAt).toBe('string')
    expect(next.updatedAt?.length).toBeGreaterThan(0)
  })

  it('prefers server updatedAt if provided', () => {
    const old = {
      symbol: 'AAPL',
      currentPrice: 100,
      dailyChangePercent: 1,
      logoUrl: 'x',
      updatedAt: '2025-01-01T00:00:00.000Z',
    }

    const upd = {
      symbol: 'AAPL',
      currentPrice: 102,
      updatedAt: '2026-01-01T00:00:00.000Z',
    }

    const next = __private__.mergeQuoteUpdate(old, upd)
    expect(next.currentPrice).toBe(102)
    expect(next.updatedAt).toBe('2026-01-01T00:00:00.000Z')
  })
})