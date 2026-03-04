import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

import API from '@shared/lib/axios';
import NewsAPI from '../api/newsClient';
import { useAuth } from '@features/auth';
import type { Article, Position } from '../types/news';

type UseNewsPageResult = {
  user: unknown;

  positionsQuery: ReturnType<typeof useQuery<Position[], Error>>;
  newsQuery: ReturnType<typeof useQuery<Article[], Error>>;

  positions: Position[];
  tickers: string[];
  symbols: string;

  articles: Article[];

  updatedLabel: string;
  isRefreshing: boolean;

  handleRefresh: () => Promise<void>;
};

export function useNewsPage(): UseNewsPageResult {
  const { user } = useAuth();

  const positionsQuery = useQuery<Position[], Error>({
    queryKey: ['positions', 'open', 'for-news'],
    enabled: Boolean(user),
    queryFn: () => API.get<Position[]>('/positions?status=open').then((r) => r.data),
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });

  const positions = useMemo(() => positionsQuery.data ?? [], [positionsQuery.data]);

  const tickers = useMemo(() => {
    return positions.map((p) => (p.ticker ?? '').trim().toUpperCase()).filter(Boolean);
  }, [positions]);

  const symbols = useMemo(() => tickers.join(','), [tickers]);

  const newsQuery = useQuery<Article[], Error>({
    queryKey: ['news', symbols],
    enabled: Boolean(user) && Boolean(symbols),
    queryFn: () => NewsAPI.get<Article[]>('/news', { params: { symbols } }).then((r) => r.data),
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });

  const articles = useMemo(() => newsQuery.data ?? [], [newsQuery.data]);

  const updatedLabel = useMemo(() => {
    const ms = newsQuery.dataUpdatedAt;
    if (!ms) return '—';
    const sec = Math.max(0, (Date.now() - ms) / 1000);
    if (sec < 60) return `${Math.round(sec)}s ago`;
    const mins = Math.round(sec / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.round(mins / 60);
    return `${hrs}h ago`;
  }, [newsQuery.dataUpdatedAt]);

  const handleRefresh = useCallback(async () => {
    await Promise.allSettled([positionsQuery.refetch(), newsQuery.refetch()]);
  }, [positionsQuery, newsQuery]);

  const isRefreshing = positionsQuery.isFetching || newsQuery.isFetching;

  return {
    user,
    positionsQuery,
    newsQuery,
    positions,
    tickers,
    symbols,
    articles,
    updatedLabel,
    isRefreshing,
    handleRefresh,
  };
}
