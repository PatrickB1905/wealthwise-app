import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export function makeTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: 0,
        gcTime: Infinity,
      },
      mutations: { retry: false },
    },
  })
}

export function withQueryClient(ui: React.ReactElement, qc: QueryClient) {
  return <QueryClientProvider client={qc}>{ui}</QueryClientProvider>
}