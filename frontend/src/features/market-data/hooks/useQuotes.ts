import { useCallback, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';

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

function safeSymbol(val: unknown): string | null {
  if (typeof val !== 'string') return null;
  const sym = val.trim().toUpperCase();
  return sym.length ? sym : null;
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

const QUOTES_BY_SYMBOL_KEY = ['quotesBySymbol'] as const;

type QuotesBySymbol = Record<string, RemoteQuote>;

function getQuotesBySymbol(qc: ReturnType<typeof useQueryClient>): QuotesBySymbol {
  return (qc.getQueryData<QuotesBySymbol>(QUOTES_BY_SYMBOL_KEY) ?? {}) as QuotesBySymbol;
}

function setQuotesBySymbol(qc: ReturnType<typeof useQueryClient>, next: QuotesBySymbol): void {
  qc.setQueryData(QUOTES_BY_SYMBOL_KEY, next);
}

function quotesEqual(a: RemoteQuote, b: RemoteQuote): boolean {
  return (
    a.symbol === b.symbol &&
    a.currentPrice === b.currentPrice &&
    a.dailyChangePercent === b.dailyChangePercent &&
    a.logoUrl === b.logoUrl &&
    (a.updatedAt ?? '') === (b.updatedAt ?? '')
  );
}

function upsertQuotesIntoCache(
  qc: ReturnType<typeof useQueryClient>,
  incoming: Array<Partial<RemoteQuote> & { symbol: string }>,
): void {
  if (!incoming.length) return;

  const prev = getQuotesBySymbol(qc);
  let changed = false;

  const next: QuotesBySymbol = { ...prev };

  for (const raw of incoming) {
    const sym = safeSymbol(raw.symbol);
    if (!sym) continue;

    const existing = next[sym];

    if (!existing) {
      if (!isFiniteNumber(raw.currentPrice)) continue;

      next[sym] = {
        symbol: sym,
        currentPrice: raw.currentPrice,
        dailyChangePercent: isFiniteNumber(raw.dailyChangePercent) ? raw.dailyChangePercent : 0,
        logoUrl: typeof raw.logoUrl === 'string' ? raw.logoUrl : '',
        updatedAt: isIsoString(raw.updatedAt) ? raw.updatedAt : new Date().toISOString(),
      };
      changed = true;
      continue;
    }

    const merged: RemoteQuote = {
      ...existing,
      symbol: sym,
      currentPrice: isFiniteNumber(raw.currentPrice) ? raw.currentPrice : existing.currentPrice,
      dailyChangePercent: isFiniteNumber(raw.dailyChangePercent)
        ? raw.dailyChangePercent
        : existing.dailyChangePercent,
      logoUrl:
        typeof raw.logoUrl === 'string' && raw.logoUrl.trim() ? raw.logoUrl : existing.logoUrl,
      updatedAt: isIsoString(raw.updatedAt) ? raw.updatedAt : existing.updatedAt,
    };

    if (!quotesEqual(existing, merged)) {
      next[sym] = merged;
      changed = true;
    }
  }

  if (changed) setQuotesBySymbol(qc, next);
}

function buildQuotesForSymbols(
  qc: ReturnType<typeof useQueryClient>,
  symbols: string[],
): RemoteQuote[] {
  const cache = getQuotesBySymbol(qc);
  const out: RemoteQuote[] = [];

  for (const s of symbols) {
    const q = cache[s];
    if (q) out.push(q);
  }

  return out;
}

function rebuildAllQuotesQueriesFromCache(qc: ReturnType<typeof useQueryClient>): void {
  const all = qc.getQueriesData<RemoteQuote[]>({ queryKey: ['quotes'] });

  for (const [key] of all) {
    const k = key as QueryKey;
    const param = typeof k[1] === 'string' ? k[1] : '';
    const symbols = normalizeSymbols(param.split(',').filter(Boolean));
    const next = buildQuotesForSymbols(qc, symbols);

    if (next.length) qc.setQueryData(key, next);
  }
}

type QuoteApiRow = Record<string, unknown>;

function parseQuoteRow(x: unknown): (Partial<RemoteQuote> & { symbol: string }) | null {
  if (!x || typeof x !== 'object') return null;

  const row = x as QuoteApiRow;

  const symbolRaw =
    typeof row.symbol === 'string'
      ? row.symbol
      : typeof row.ticker === 'string'
        ? row.ticker
        : '';

  const symbol = safeSymbol(symbolRaw);
  if (!symbol) return null;

  const currentPrice = isFiniteNumber(row.currentPrice) ? row.currentPrice : undefined;
  const dailyChangePercent = isFiniteNumber(row.dailyChangePercent)
    ? row.dailyChangePercent
    : undefined;
  const logoUrl = typeof row.logoUrl === 'string' ? row.logoUrl : undefined;
  const updatedAt = isIsoString(row.updatedAt) ? row.updatedAt : undefined;

  return { symbol, currentPrice, dailyChangePercent, logoUrl, updatedAt };
}

export function useQuotes(symbols: string[]) {
  const queryClient = useQueryClient();

  const normalized = useMemo(() => normalizeSymbols(symbols), [symbols]);
  const symbolsParam = useMemo(() => normalized.join(','), [normalized]);

  const result = useQuery<RemoteQuote[], Error>({
    queryKey: ['quotes', symbolsParam],
    enabled: normalized.length > 0,

    queryFn: async () => {
      const res = await MarketAPI.get<unknown>('/quotes', { params: { symbols: symbolsParam } });

      const data = res.data as unknown;
      const raw = Array.isArray(data) ? data : data && typeof data === 'object' ? [data] : [];

      const incoming = raw
        .map(parseQuoteRow)
        .filter((x): x is Partial<RemoteQuote> & { symbol: string } => x !== null);

      upsertQuotesIntoCache(queryClient, incoming);

      return buildQuotesForSymbols(queryClient, normalized);
    },

    placeholderData: () => buildQuotesForSymbols(queryClient, normalized),

    staleTime: 15_000,
    refetchInterval: 20_000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
  });

  const handler = useCallback(
    (updates: PriceUpdate) => {
      if (!Array.isArray(updates) || updates.length === 0) return;

      upsertQuotesIntoCache(queryClient, updates);
      rebuildAllQuotesQueriesFromCache(queryClient);
    },
    [queryClient],
  );

  useEffect(() => {
    if (normalized.length === 0) return;

    const socket = getSocket();
    socket.on('price:update', handler);
    socket.on('price:snapshot', handler);

    socket.emit('price:subscribe', { symbols: normalized });

    return () => {
      socket.emit('price:unsubscribe', { symbols: normalized });
      socket.off('price:update', handler);
      socket.off('price:snapshot', handler);
    };
  }, [handler, normalized]);

  return result;
}

/** @internal (used for unit tests) */
export const __private__ = { mergeQuoteUpdate };
