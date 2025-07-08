import { useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import MarketAPI from '../api/marketData';
import { getSocket } from '../utils/socket';

interface RemoteQuote {
  symbol: string;
  currentPrice: number;
  dailyChangePercent: number;
  logoUrl: string;
}

export function useQuotes(symbols: string[]) {
  const queryClient = useQueryClient();
  const sortedKey = [...symbols].sort().join(',');

  const result = useQuery<RemoteQuote[], Error>({
    queryKey: ['quotes', sortedKey],
    queryFn: () =>
      MarketAPI.get<RemoteQuote[]>('/quotes', {
        params: { symbols: symbols.join(',') },
      }).then(res => res.data),
    enabled: symbols.length > 0,
    keepPreviousData: true,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const handler = useCallback(
    (updates: Array<{ symbol: string; currentPrice: number; dailyChangePercent: number }>) => {
      queryClient.setQueryData<RemoteQuote[]>(['quotes', sortedKey], old => {
        if (!old) return old;
        return old.map(q => {
          const upd = updates.find(u => u.symbol === q.symbol);
          return upd
            ? { ...q, currentPrice: upd.currentPrice, dailyChangePercent: upd.dailyChangePercent }
            : q;
        });
      });
    },
    [queryClient, sortedKey]
  );

  useEffect(() => {
    if (symbols.length === 0) return;
    const socket = getSocket();
    socket.on('price:update', handler);
    return () => {
      socket.off('price:update', handler);
    };
  }, [handler, symbols.length]);

  return result;
}