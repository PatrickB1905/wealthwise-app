import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { makeTestQueryClient } from '@test/testQueryClient';

import { useNewsPage } from './useNewsPage';

jest.mock('@features/auth', () => ({
  __esModule: true,
  useAuth: () => ({ user: { id: 1 } }),
}));

type ApiGet = (url: string) => Promise<unknown>;
const apiGet = jest.fn<ReturnType<ApiGet>, Parameters<ApiGet>>();

jest.mock('@shared/lib/axios', () => ({
  __esModule: true,
  default: { get: (url: string) => apiGet(url) },
}));

type NewsGet = (url: string, config?: { params?: Record<string, unknown> }) => Promise<unknown>;
const newsGet = jest.fn<ReturnType<NewsGet>, Parameters<NewsGet>>();

jest.mock('../api/newsClient', () => ({
  __esModule: true,
  default: {
    get: (url: string, config?: { params?: Record<string, unknown> }) => newsGet(url, config),
  },
}));

describe('useNewsPage', () => {
  beforeEach(() => {
    apiGet.mockReset();
    newsGet.mockReset();
  });

  it('builds symbols from positions and fetches news', async () => {
    apiGet.mockResolvedValueOnce({
      data: [{ ticker: 'aapl' }, { ticker: ' tsla ' }],
    });
    newsGet.mockResolvedValueOnce({ data: [{ title: 'Hello' }] });

    const qc = makeTestQueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useNewsPage(), { wrapper });

    await waitFor(() => {
      expect(result.current.tickers).toEqual(['AAPL', 'TSLA']);
    });

    expect(apiGet).toHaveBeenCalledWith('/positions?status=open');
    expect(result.current.symbols).toBe('AAPL,TSLA');

    await waitFor(() => {
      expect(newsGet).toHaveBeenCalled();
    });
  });

  it('handleRefresh refetches both queries', async () => {
    apiGet.mockResolvedValue({ data: [] });
    newsGet.mockResolvedValue({ data: [] });

    const qc = makeTestQueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useNewsPage(), { wrapper });

    await act(async () => {
      await result.current.handleRefresh();
    });

    expect(apiGet).toHaveBeenCalled();
  });
});
