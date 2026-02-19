import { useEffect, useMemo, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import MarketAPI from '../api/marketData'
import { getSocket } from '../utils/socket'

export interface RemoteQuote {
  symbol: string
  currentPrice: number
  dailyChangePercent: number
  logoUrl: string
}

type PriceUpdate = Array<{
  symbol: string
  currentPrice: number
  dailyChangePercent: number
}>

function normalizeSymbols(symbols: string[]): string[] {
  return [...symbols]
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean)
    .sort()
}

export function useQuotes(symbols: string[]) {
  const queryClient = useQueryClient()

  const normalized = useMemo(() => normalizeSymbols(symbols), [symbols])
  const symbolsParam = useMemo(() => normalized.join(','), [normalized])

  const result = useQuery<RemoteQuote[], Error>({
    queryKey: ['quotes', symbolsParam],
    queryFn: () =>
      MarketAPI.get<RemoteQuote[]>('/quotes', { params: { symbols: symbolsParam } }).then(
        (res) => res.data
      ),
    enabled: normalized.length > 0,
    keepPreviousData: true,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  })

  const handler = useCallback(
    (updates: PriceUpdate) => {
      const updateMap = new Map(updates.map((u) => [u.symbol, u]))
      queryClient.setQueryData<RemoteQuote[]>(['quotes', symbolsParam], (old) => {
        if (!old) return old
        return old.map((q) => {
          const upd = updateMap.get(q.symbol)
          return upd
            ? { ...q, currentPrice: upd.currentPrice, dailyChangePercent: upd.dailyChangePercent }
            : q
        })
      })
    },
    [queryClient, symbolsParam]
  )

  useEffect(() => {
    if (normalized.length === 0) return

    const socket = getSocket()
    socket.on('price:update', handler)

    return () => {
      socket.off('price:update', handler)
    }
  }, [handler, normalized.length])

  return result
}
