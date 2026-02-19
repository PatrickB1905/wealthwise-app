import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios'
import { STORAGE_KEYS } from '../config/env'
import { AuthContext, type AuthContextValue, type User } from './authContext'

type AuthProviderProps = {
  children: React.ReactNode
}

type LoginResponse = {
  token: string
  user: User
}

type MeResponse = User

function clearAuthStorage() {
  localStorage.removeItem(STORAGE_KEYS.TOKEN)
  const userKey = (STORAGE_KEYS as unknown as { USER?: string }).USER ?? 'ww_user'
  localStorage.removeItem(userKey)
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const navigate = useNavigate()

  // Bootstraps session from API if a token exists
  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN)

    if (!token) {
      setIsBootstrapping(false)
      return
    }

    API.get<MeResponse>('/auth/me')
      .then((res) => {
        setUser(res.data)
        const userKey = (STORAGE_KEYS as unknown as { USER?: string }).USER ?? 'ww_user'
        localStorage.setItem(userKey, JSON.stringify(res.data))
      })
      .catch(() => {
        clearAuthStorage()
        setUser(null)
      })
      .finally(() => {
        setIsBootstrapping(false)
      })
  }, [])

  const login: AuthContextValue['login'] = useCallback(
    async (email, password) => {
      const res = await API.post<LoginResponse>('/auth/login', { email, password })
      const { token, user } = res.data

      localStorage.setItem(STORAGE_KEYS.TOKEN, token)
      const userKey = (STORAGE_KEYS as unknown as { USER?: string }).USER ?? 'ww_user'
      localStorage.setItem(userKey, JSON.stringify(user))

      setUser(user)
      navigate('/app/positions', { replace: true })
    },
    [navigate]
  )

  const register: AuthContextValue['register'] = useCallback(
    async (firstName, lastName, email, password) => {
      const res = await API.post<LoginResponse>('/auth/register', {
        firstName,
        lastName,
        email,
        password,
      })
      const { token, user } = res.data

      localStorage.setItem(STORAGE_KEYS.TOKEN, token)
      const userKey = (STORAGE_KEYS as unknown as { USER?: string }).USER ?? 'ww_user'
      localStorage.setItem(userKey, JSON.stringify(user))

      setUser(user)
      navigate('/app/positions', { replace: true })
    },
    [navigate]
  )

  const logout: AuthContextValue['logout'] = useCallback(() => {
    clearAuthStorage()
    setUser(null)
    navigate('/login', { replace: true })
  }, [navigate])

  const value = useMemo<AuthContextValue>(
    () => ({ user, isBootstrapping, login, register, logout }),
    [user, isBootstrapping, login, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
