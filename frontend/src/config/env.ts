type ViteEnvKey =
  | 'VITE_POSITIONS_API_URL'
  | 'VITE_MARKET_DATA_API_URL'
  | 'VITE_ANALYTICS_API_URL'
  | 'VITE_NEWS_API_URL'
  | 'VITE_POSITIONS_WS_URL'

type EnvLike = Record<string, unknown>

function readInjectedEnv(): EnvLike | undefined {
  return (globalThis as unknown as { __VITE_ENV__?: EnvLike }).__VITE_ENV__
}

function readEnv(name: ViteEnvKey): string | undefined {
  const injected = readInjectedEnv()
  const injectedVal = injected?.[name]
  if (typeof injectedVal === 'string' && injectedVal.trim()) return injectedVal

  const procVal = (process.env as Record<string, string | undefined>)[name]
  if (typeof procVal === 'string' && procVal.trim()) return procVal

  return undefined
}

function requiredEnv(name: Exclude<ViteEnvKey, 'VITE_POSITIONS_WS_URL'>): string {
  const value = readEnv(name)
  if (!value) {
    const mode = process.env.NODE_ENV ?? 'unknown'
    throw new Error(
      [
        `Missing required env var: ${name}`,
        `Mode: ${mode}`,
        'Fix:',
        '- Create frontend/.env.local (non-docker) or set env at build time (docker).',
        `- Ensure ${name} is defined.`,
      ].join('\n')
    )
  }
  return value
}

export const ENV = {
  POSITIONS_API_URL: requiredEnv('VITE_POSITIONS_API_URL'),
  MARKET_DATA_API_URL: requiredEnv('VITE_MARKET_DATA_API_URL'),
  ANALYTICS_API_URL: requiredEnv('VITE_ANALYTICS_API_URL'),
  NEWS_API_URL: requiredEnv('VITE_NEWS_API_URL'),
  POSITIONS_WS_URL: readEnv('VITE_POSITIONS_WS_URL'),
} as const

export const STORAGE_KEYS = {
  TOKEN: 'ww_token',
  USER: 'ww_user',
} as const