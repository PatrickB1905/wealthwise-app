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

function requiredEnv(name: Exclude<ViteEnvKey, 'VITE_POSITIONS_WS_URL'>): string {
  const value = readViteEnv(name);
  if (!value) {
    const mode = getEnvSource().MODE ?? process.env.NODE_ENV ?? 'unknown';
    throw new Error(
      [
        `Missing required env var: ${name}`,
        `Mode: ${mode}`,
        'Fix:',
        '- For Docker: ensure docker-compose passes VITE_* build args to the frontend image.',
        '- For local dev: create frontend/.env.local with the required VITE_* vars.',
        '- For Jest: ensure src/test/jestEnvSetup.ts sets globalThis.__VITE_ENV__ defaults.',
      ].join('\n'),
    );
  }
  return value;
}

export const ENV = {
  POSITIONS_API_URL: requiredEnv('VITE_POSITIONS_API_URL'),
  MARKET_DATA_API_URL: requiredEnv('VITE_MARKET_DATA_API_URL'),
  ANALYTICS_API_URL: requiredEnv('VITE_ANALYTICS_API_URL'),
  NEWS_API_URL: requiredEnv('VITE_NEWS_API_URL'),
  POSITIONS_WS_URL: readViteEnv('VITE_POSITIONS_WS_URL'),
} as const;

export const STORAGE_KEYS = {
  TOKEN: 'ww_token',
  USER: 'ww_user',
} as const;
