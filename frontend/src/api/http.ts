import axios, { type AxiosInstance } from 'axios'

type ErrorPayload = {
  error?: string
  message?: string
}

export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (!axios.isAxiosError(err)) return fallback

  const data = err.response?.data as ErrorPayload | undefined
  return data?.error ?? data?.message ?? fallback
}

type CreateHttpClientOptions = {
  baseURL: string
  withAuth?: boolean
  timeoutMs?: number
}

export function createHttpClient(options: CreateHttpClientOptions): AxiosInstance {
  const client = axios.create({
    baseURL: options.baseURL,
    timeout: options.timeoutMs ?? 15_000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (options.withAuth) {
    client.interceptors.request.use((config) => {
      const token = localStorage.getItem('ww_token')
      if (token) {
        config.headers = config.headers ?? {}
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })
  }

  return client
}

export function envApiUrl(key: string, fallback: string): string {
  const v = (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.[key]
  return (v && v.trim().length > 0) ? v.trim() : fallback
}
