import { io, type Socket } from 'socket.io-client'
import { ENV, STORAGE_KEYS } from '../config/env'

let socket: Socket | null = null

type StoredUser = { id: number } | null

function safeParseUser(json: string | null): StoredUser {
  if (!json) return null
  try {
    return JSON.parse(json) as { id: number }
  } catch {
    return null
  }
}

function resolveSocketUrl(): string {
  const wsUrl = (import.meta.env.VITE_POSITIONS_WS_URL as string | undefined)?.trim()
  if (wsUrl) return wsUrl

  const apiUrl = ENV.POSITIONS_API_URL.trim()
  try {
    const u = new URL(apiUrl)
    u.pathname = ''
    u.search = ''
    u.hash = ''
    return u.toString().replace(/\/$/, '')
  } catch {
    return apiUrl.replace(/\/+$/, '')
  }
}

export function getSocket(): Socket {
  if (socket) return socket

  const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
  const user = safeParseUser(localStorage.getItem(STORAGE_KEYS.USER))
  const userId = user?.id

  socket = io(resolveSocketUrl(), {
    transports: ['websocket'],
    auth: { token, userId },
  })

  socket.on('connect', () => {
    if (userId) socket?.emit('join', userId)
  })

  return socket
}

export function resetSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
