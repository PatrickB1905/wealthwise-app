function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v || v.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return v
}

export const ENV = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT ?? 4000),
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
  DATABASE_URL: requireEnv('DATABASE_URL'),
  JWT_SECRET: requireEnv('JWT_SECRET'),
} as const
