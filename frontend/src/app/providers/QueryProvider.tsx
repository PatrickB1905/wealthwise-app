import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { queryClient } from '@shared/lib/query-client';

type Props = { children: React.ReactNode };

type ImportMetaWithEnv = ImportMeta & { env?: { DEV?: boolean } };

function isDevEnv(): boolean {
  try {
    return Boolean((import.meta as ImportMetaWithEnv).env?.DEV);
  } catch {
    return process.env.NODE_ENV !== 'production';
  }
}

export function QueryProvider({ children }: Props) {
  const showDevtools = isDevEnv();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {showDevtools ? <ReactQueryDevtools initialIsOpen={false} /> : null}
    </QueryClientProvider>
  );
}
