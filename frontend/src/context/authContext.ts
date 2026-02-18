import { createContext } from 'react'

export type User = {
  id: number
  email: string
  createdAt: string
}

export type AuthContextValue = {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
