function requiredEnv(name: string): string {
  const value = import.meta.env[name] as string | undefined
  if (!value) {
    throw new Error(`Missing required env var: ${name}`)
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
