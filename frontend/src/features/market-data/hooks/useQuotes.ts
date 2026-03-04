import { useCallback, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import MarketAPI from '../api/marketDataClient';
import { getSocket } from '@shared/lib/socket';

export interface RemoteQuote {
  symbol: string;
  currentPrice: number;
  dailyChangePercent: number;
  logoUrl: string;
  updatedAt?: string;
}

type PriceUpdate = Array<{
  symbol: string;
  currentPrice?: number;
  dailyChangePercent?: number;
  logoUrl?: string;
  updatedAt?: string;
}>;

function normalizeSymbols(symbols: string[]): string[] {
  return [...symbols]
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean)
    .sort();
}

function isFiniteNumber(val: unknown): val is number {
  return typeof val === 'number' && Number.isFinite(val);
}

function isIsoString(val: unknown): val is string {
  return typeof val === 'string' && val.trim().length > 0 && !Number.isNaN(Date.parse(val));
}

function mergeQuoteUpdate(old: RemoteQuote, upd: PriceUpdate[number]): RemoteQuote {
  const nextUpdatedAt = isIsoString(upd.updatedAt) ? upd.updatedAt : undefined;

  return {
    ...old,
    currentPrice: isFiniteNumber(upd.currentPrice) ? upd.currentPrice : old.currentPrice,
    dailyChangePercent: isFiniteNumber(upd.dailyChangePercent)
      ? upd.dailyChangePercent
      : old.dailyChangePercent,
    logoUrl: typeof upd.logoUrl === 'string' && upd.logoUrl.trim() ? upd.logoUrl : old.logoUrl,
    updatedAt: nextUpdatedAt ?? old.updatedAt ?? new Date().toISOString(),
  };
}

function buildPlaceholderFromCache(
  qc: ReturnType<typeof useQueryClient>,
  symbols: string[],
): RemoteQuote[] | undefined {
  if (symbols.length === 0) return undefined;

  const all = qc.getQueriesData<RemoteQuote[]>({ queryKey: ['quotes'] });
  const bySym = new Map<string, RemoteQuote>();

  for (const [, data] of all) {
    if (!data) continue;
    for (const q of data) {
      const sym = String(q.symbol).toUpperCase();
      if (!bySym.has(sym)) bySym.set(sym, q);
    }
  }

  const out: RemoteQuote[] = [];
  for (const s of symbols) {
    const q = bySym.get(s);
    if (q) out.push(q);
  }

  return out.length ? out : undefined;
}

export function useQuotes(symbols: string[]) {
  const queryClient = useQueryClient();

  const normalized = useMemo(() => normalizeSymbols(symbols), [symbols]);
  const symbolsParam = useMemo(() => normalized.join(','), [normalized]);

  const result = useQuery<RemoteQuote[], Error>({
    queryKey: ['quotes', symbolsParam],
    queryFn: () =>
      MarketAPI.get<RemoteQuote[]>('/quotes', { params: { symbols: symbolsParam } }).then(
        (res) => res.data,
      ),
    enabled: normalized.length > 0,

    placeholderData: (prev) => prev ?? buildPlaceholderFromCache(queryClient, normalized),

    staleTime: 15_000,
    refetchInterval: 20_000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
  });

  const handler = useCallback(
    (updates: PriceUpdate) => {
      if (!Array.isArray(updates) || updates.length === 0) return;
      const updateMap = new Map(updates.map((u) => [String(u.symbol).toUpperCase(), u]));

      const all = queryClient.getQueriesData<RemoteQuote[]>({ queryKey: ['quotes'] });
      for (const [key, old] of all) {
        if (!old || old.length === 0) continue;

        const next = old.map((q) => {
          const upd = updateMap.get(String(q.symbol).toUpperCase());
          return upd ? mergeQuoteUpdate(q, upd) : q;
        });

        queryClient.setQueryData(key, next);
      }
    },
    [queryClient],
  );

  useEffect(() => {
    if (normalized.length === 0) return;

    const socket = getSocket();
    socket.on('price:update', handler);
    socket.on('price:snapshot', handler);

    return () => {
      socket.off('price:update', handler);
      socket.off('price:snapshot', handler);
    };
  }, [handler, normalized.length]);

  return result;
}

/** @internal (used for unit tests) */
export const __private__ = { mergeQuoteUpdate };
