type ViteEnvKey =
  | 'VITE_POSITIONS_API_URL'
  | 'VITE_MARKET_DATA_API_URL'
  | 'VITE_ANALYTICS_API_URL'
  | 'VITE_NEWS_API_URL'
  | 'VITE_POSITIONS_WS_URL';

type ViteEnvShape = Partial<Record<ViteEnvKey, string>> & { MODE?: string };

declare global {
  var __VITE_ENV__: ViteEnvShape | undefined;
}

function getEnvSource(): ViteEnvShape {
  if (globalThis.__VITE_ENV__) return globalThis.__VITE_ENV__ as ViteEnvShape;
  return process.env as unknown as ViteEnvShape;
}

function readViteEnv(name: ViteEnvKey): string | undefined {
  const raw = getEnvSource()[name];
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    return trimmed.length ? trimmed : undefined;
  }
  return undefined;
}

function withDefault(value: string | undefined, fallback: string): string {
  return value?.trim() ? value.trim() : fallback;
}

export const ENV = {
  POSITIONS_API_URL: withDefault(readViteEnv('VITE_POSITIONS_API_URL'), '/api/positions'),
  MARKET_DATA_API_URL: withDefault(readViteEnv('VITE_MARKET_DATA_API_URL'), '/api/market-data'),
  ANALYTICS_API_URL: withDefault(readViteEnv('VITE_ANALYTICS_API_URL'), '/api/analytics'),
  NEWS_API_URL: withDefault(readViteEnv('VITE_NEWS_API_URL'), '/api/news'),
  POSITIONS_WS_URL: readViteEnv('VITE_POSITIONS_WS_URL'),
} as const;

export const STORAGE_KEYS = {
  TOKEN: 'ww_token',
  USER: 'ww_user',
} as const;