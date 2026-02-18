import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios'
import { AuthContext, type AuthContextValue, type User } from './authContext'

type AuthProviderProps = {
  children: React.ReactNode
}

type LoginResponse = {
  token: string
  user: User
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('ww_token')
    const storedUser = localStorage.getItem('ww_user')
    if (token && storedUser) {
      setUser(JSON.parse(storedUser) as User)
    }
  }, [])

  const login: AuthContextValue['login'] = useCallback(
    async (email, password) => {
      const res = await API.post<LoginResponse>('/auth/login', { email, password })
      const { token, user } = res.data

      localStorage.setItem('ww_token', token)
      localStorage.setItem('ww_user', JSON.stringify(user))

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

      localStorage.setItem('ww_token', token)
      localStorage.setItem('ww_user', JSON.stringify(user))

      setUser(user)
      navigate('/app/positions', { replace: true })
    },
    [navigate]
  )

  const logout: AuthContextValue['logout'] = useCallback(() => {
    localStorage.removeItem('ww_token')
    localStorage.removeItem('ww_user')

    setUser(null)
    navigate('/login', { replace: true })
  }, [navigate])

  const value = useMemo<AuthContextValue>(
    () => ({ user, login, register, logout }),
    [user, login, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
