import { renderHook, act } from '@testing-library/react'
import type { QueryClient } from '@tanstack/react-query'

import MarketAPI from '../api/marketData'
import { getSocket } from '../utils/socket'
import { makeTestQueryClient, withQueryClient } from '../test/testQueryClient'
import { useQuotes, type RemoteQuote } from './useQuotes'

jest.mock('../api/marketData', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))

type PriceUpdate = Readonly<{
  symbol: string
  currentPrice: number
  dailyChangePercent: number
}>

type Handler = (payload: PriceUpdate[]) => void

const socket = {
  on: jest.fn(),
  off: jest.fn(),
}

jest.mock('../utils/socket', () => ({
  __esModule: true,
  getSocket: () => socket,
}))

const MarketAPIMock = MarketAPI as unknown as { get: jest.Mock }
const getSocketMock = getSocket as unknown as jest.Mock

function seedQuotes(qc: QueryClient, key: readonly unknown[], data: RemoteQuote[]) {
  qc.setQueryData(key, data)
}

describe('useQuotes', () => {
  beforeEach(() => {
    socket.on.mockReset()
    socket.off.mockReset()
    MarketAPIMock.get.mockReset()
    getSocketMock?.mockClear?.()
  })

  it('applies price:update to all cached quotes queries', async () => {
    const qc = makeTestQueryClient()

    seedQuotes(qc, ['quotes', 'AAPL'], [
      { symbol: 'AAPL', currentPrice: 100, dailyChangePercent: 1, logoUrl: 'a' },
    ])

    seedQuotes(qc, ['quotes', 'AAPL,MSFT'], [
      { symbol: 'AAPL', currentPrice: 100, dailyChangePercent: 1, logoUrl: 'a' },
      { symbol: 'MSFT', currentPrice: 200, dailyChangePercent: 2, logoUrl: 'm' },
    ])

    MarketAPIMock.get.mockResolvedValueOnce({
      data: [{ symbol: 'AAPL', currentPrice: 100, dailyChangePercent: 1, logoUrl: 'a' }],
    })

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      withQueryClient(<>{children}</>, qc)

    renderHook(() => useQuotes(['AAPL']), { wrapper })

    const onCalls = socket.on.mock.calls as Array<[string, Handler]>
    const priceUpdateCall = onCalls.find((c) => c[0] === 'price:update')
    expect(priceUpdateCall).toBeTruthy()

    const handler = priceUpdateCall![1]

    act(() => {
      handler([
        { symbol: 'AAPL', currentPrice: 123.45, dailyChangePercent: 3.21 },
        { symbol: 'MSFT', currentPrice: 250.0, dailyChangePercent: 1.11 },
      ])
    })

    const aaplOnly = qc.getQueryData<RemoteQuote[]>(['quotes', 'AAPL'])
    const both = qc.getQueryData<RemoteQuote[]>(['quotes', 'AAPL,MSFT'])

    expect(aaplOnly?.[0].currentPrice).toBeCloseTo(123.45)
    expect(both?.find((q) => q.symbol === 'AAPL')?.currentPrice).toBeCloseTo(123.45)
    expect(both?.find((q) => q.symbol === 'MSFT')?.currentPrice).toBeCloseTo(250.0)
  })
})