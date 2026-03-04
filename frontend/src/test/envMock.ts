type ViteEnvKey =
  | 'VITE_POSITIONS_API_URL'
  | 'VITE_MARKET_DATA_API_URL'
  | 'VITE_ANALYTICS_API_URL'
  | 'VITE_NEWS_API_URL'
  | 'VITE_POSITIONS_WS_URL';

function readFromTestEnv(name: ViteEnvKey): string | undefined {
  const fromGlobal = (globalThis as { __VITE_ENV__?: Record<string, unknown> }).__VITE_ENV__?.[
    name
  ];
  const fromProcess = process.env[name];
  const raw = typeof fromGlobal === 'string' ? fromGlobal : fromProcess;

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    return trimmed.length ? trimmed : undefined;
  }
  return undefined;
}

function requiredEnv(name: Exclude<ViteEnvKey, 'VITE_POSITIONS_WS_URL'>): string {
  const value = readFromTestEnv(name);
  if (!value) {
    throw new Error(`Missing required env var in tests: ${name}`);
  }
  return value;
}

export const ENV = {
  POSITIONS_API_URL: requiredEnv('VITE_POSITIONS_API_URL'),
  MARKET_DATA_API_URL: requiredEnv('VITE_MARKET_DATA_API_URL'),
  ANALYTICS_API_URL: requiredEnv('VITE_ANALYTICS_API_URL'),
  NEWS_API_URL: requiredEnv('VITE_NEWS_API_URL'),
  POSITIONS_WS_URL: readFromTestEnv('VITE_POSITIONS_WS_URL'),
} as const;

export const STORAGE_KEYS = {
  TOKEN: 'ww_token',
  USER: 'ww_user',
} as const;
