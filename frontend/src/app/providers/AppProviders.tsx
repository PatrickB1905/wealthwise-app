import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';

import theme from '../../shared/theme';
import { AuthProvider } from '@features/auth';
import { QueryProvider } from './QueryProvider';

type Props = { children: React.ReactNode };

export function AppProviders({ children }: Props) {
  return (
    <React.StrictMode>
      <QueryProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
            <AuthProvider>{children}</AuthProvider>
          </BrowserRouter>
        </ThemeProvider>
      </QueryProvider>
    </React.StrictMode>
  );
}
