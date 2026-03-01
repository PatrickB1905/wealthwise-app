import { act } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'

jest.mock('../api/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}))

jest.mock('../utils/socket', () => ({
  __esModule: true,
  resetSocket: jest.fn(),
}))

import API from '../api/axios'
import { resetSocket } from '../utils/socket'
import { AUTH_EVENTS } from '../api/http'
import { STORAGE_KEYS } from '../config/env'
import { AuthProvider } from './authProvider'
import { useAuth } from './useAuth'

const apiMock = API as unknown as { get: jest.Mock }
const resetSocketMock = resetSocket as unknown as jest.Mock

function ShowAuthState() {
  const { user, isBootstrapping } = useAuth()
  return (
    <div>
      <div data-testid="boot">{String(isBootstrapping)}</div>
      <div data-testid="user">{user?.email ?? 'none'}</div>
    </div>
  )
}

function ShowPath() {
  const loc = useLocation()
  return <div data-testid="path">{loc.pathname}</div>
}

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    apiMock.get.mockReset()
    resetSocketMock.mockReset()
  })

  it('when no token exists, stops bootstrapping and does not call /auth/me', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <ShowAuthState />
        </AuthProvider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('boot')).toHaveTextContent('false')
    })

    expect(apiMock.get).not.toHaveBeenCalled()
    expect(screen.getByTestId('user')).toHaveTextContent('none')
  })

  it('when token exists, fetches /auth/me and stores user', async () => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, 't')

    apiMock.get.mockResolvedValue({
      data: { id: 1, email: 'a@b.com', createdAt: new Date().toISOString() },
    })

    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <ShowAuthState />
        </AuthProvider>
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByTestId('boot')).toHaveTextContent('false'))
    expect(apiMock.get).toHaveBeenCalledWith('/auth/me')
    expect(screen.getByTestId('user')).toHaveTextContent('a@b.com')

    expect(localStorage.getItem(STORAGE_KEYS.USER)).toContain('a@b.com')
  })

  it('when /auth/me fails, clears storage and resets socket', async () => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, 't')
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify({ id: 9 }))

    apiMock.get.mockRejectedValue(new Error('fail'))

    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <ShowAuthState />
        </AuthProvider>
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByTestId('boot')).toHaveTextContent('false'))

    expect(localStorage.getItem(STORAGE_KEYS.TOKEN)).toBeNull()
    expect(localStorage.getItem(STORAGE_KEYS.USER)).toBeNull()
    expect(resetSocketMock).toHaveBeenCalled()
    expect(screen.getByTestId('user')).toHaveTextContent('none')
  })

  it('on AUTH_EVENTS.UNAUTHORIZED, clears auth and navigates to /login', async () => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, 't')
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify({ id: 1 }))

    apiMock.get.mockResolvedValue({
      data: { id: 1, email: 'a@b.com', createdAt: new Date().toISOString() },
    })

    render(
      <MemoryRouter initialEntries={['/app/positions']}>
        <Routes>
          <Route
            path="/*"
            element={
              <AuthProvider>
                <ShowPath />
              </AuthProvider>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => expect(apiMock.get).toHaveBeenCalled())

    act(() => {
      window.dispatchEvent(new CustomEvent(AUTH_EVENTS.UNAUTHORIZED))
    })

    await waitFor(() => {
      expect(screen.getByTestId('path')).toHaveTextContent('/login')
    })

    expect(localStorage.getItem(STORAGE_KEYS.TOKEN)).toBeNull()
    expect(localStorage.getItem(STORAGE_KEYS.USER)).toBeNull()
    expect(resetSocketMock).toHaveBeenCalled()
  })
})