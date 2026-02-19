type ViteEnvKey =
  | 'VITE_POSITIONS_API_URL'
  | 'VITE_MARKET_DATA_API_URL'
  | 'VITE_ANALYTICS_API_URL'
  | 'VITE_NEWS_API_URL'

function requiredEnv(name: ViteEnvKey): string {
  const value = import.meta.env[name] as string | undefined
  if (!value) {
    const mode = (import.meta.env.MODE as string | undefined) ?? 'unknown'
    throw new Error(
      [
        `Missing required env var: ${name}`,
        `Vite mode: ${mode}`,
        'Fix:',
        `- Create frontend/.env.local (non-docker) or set env at build time (docker).`,
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
} as const

export const STORAGE_KEYS = {
  TOKEN: 'ww_token',
  USER: 'ww_user',
} as const
