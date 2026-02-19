import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import API from '../api/axios'
import { AUTH_EVENTS } from '../api/http'
import { STORAGE_KEYS } from '../config/env'
import { resetSocket } from '../utils/socket'

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
  localStorage.removeItem(STORAGE_KEYS.USER)
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN)

    if (!token) {
      setIsBootstrapping(false)
      return
    }

    API.get<MeResponse>('/auth/me')
      .then((res) => {
        setUser(res.data)
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(res.data))
      })
      .catch(() => {
        clearAuthStorage()
        resetSocket()
        setUser(null)
      })
      .finally(() => {
        setIsBootstrapping(false)
      })
  }, [])

  useEffect(() => {
    const onUnauthorized = () => {
      clearAuthStorage()
      resetSocket()
      setUser(null)

      if (window.location.pathname !== '/login') {
        navigate('/login', { replace: true })
      }
    }

    window.addEventListener(AUTH_EVENTS.UNAUTHORIZED, onUnauthorized)
    return () => window.removeEventListener(AUTH_EVENTS.UNAUTHORIZED, onUnauthorized)
  }, [navigate])

  const login: AuthContextValue['login'] = useCallback(
    async (email, password) => {
      const res = await API.post<LoginResponse>('/auth/login', { email, password })
      const { token, user } = res.data

      localStorage.setItem(STORAGE_KEYS.TOKEN, token)
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))

      resetSocket()
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
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))

      resetSocket()
      setUser(user)
      navigate('/app/positions', { replace: true })
    },
    [navigate]
  )

  const logout: AuthContextValue['logout'] = useCallback(() => {
    clearAuthStorage()
    resetSocket()
    setUser(null)
    navigate('/login', { replace: true })
  }, [navigate])

  const value = useMemo<AuthContextValue>(
    () => ({ user, isBootstrapping, login, register, logout }),
    [user, isBootstrapping, login, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
