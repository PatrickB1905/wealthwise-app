import { TextDecoder, TextEncoder } from 'node:util'

type ViteEnvDefaults = {
  VITE_POSITIONS_API_URL: string
  VITE_MARKET_DATA_API_URL: string
  VITE_ANALYTICS_API_URL: string
  VITE_NEWS_API_URL: string
  VITE_POSITIONS_WS_URL: string
}

declare global {
  var __VITE_ENV__: Partial<ViteEnvDefaults> | undefined
}

if (!globalThis.TextEncoder) {
  globalThis.TextEncoder = TextEncoder
}
if (!globalThis.TextDecoder) {
  globalThis.TextDecoder = TextDecoder as unknown as typeof globalThis.TextDecoder
}

const defaults: ViteEnvDefaults = {
  VITE_POSITIONS_API_URL: 'http://localhost:3000/api',
  VITE_MARKET_DATA_API_URL: 'http://localhost:5000/api',
  VITE_ANALYTICS_API_URL: 'http://localhost:7000/api',
  VITE_NEWS_API_URL: 'http://localhost:6500/api',
  VITE_POSITIONS_WS_URL: 'ws://localhost:3000',
}

for (const [k, v] of Object.entries(defaults) as Array<[keyof ViteEnvDefaults, string]>) {
  if (!process.env[k]) process.env[k] = v
}

globalThis.__VITE_ENV__ = { ...(globalThis.__VITE_ENV__ ?? {}), ...defaults }