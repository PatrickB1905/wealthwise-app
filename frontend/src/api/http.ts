import axios from 'axios'
import type { AxiosInstance } from 'axios'
import { STORAGE_KEYS } from '../config/env'

export const AUTH_EVENTS = {
  UNAUTHORIZED: 'auth:unauthorized',
} as const

function clearAuthStorage() {
  localStorage.removeItem(STORAGE_KEYS.TOKEN)
  localStorage.removeItem(STORAGE_KEYS.USER)
}

let unauthorizedEmitted = false
let unauthorizedTimer: number | null = null

function emitUnauthorizedEvent() {
  if (unauthorizedEmitted) return
  unauthorizedEmitted = true

  window.dispatchEvent(new CustomEvent(AUTH_EVENTS.UNAUTHORIZED))

  if (unauthorizedTimer) window.clearTimeout(unauthorizedTimer)
  unauthorizedTimer = window.setTimeout(() => {
    unauthorizedEmitted = false
    unauthorizedTimer = null
  }, 1000)
}

export function createHttpClient(baseURL: string): AxiosInstance {
  const client = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
  })

  client.interceptors.request.use((config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
    if (token) {
      config.headers = config.headers ?? {}
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  client.interceptors.response.use(
    (res) => res,
    (err) => {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        clearAuthStorage()
        emitUnauthorizedEvent()
      }
      return Promise.reject(err)
    }
  )

  return client
}

export function getErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const msg = (err.response?.data as { error?: string } | undefined)?.error
    return msg ?? fallback
  }
  return fallback
}
