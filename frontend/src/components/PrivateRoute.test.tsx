import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'

jest.mock('../context/useAuth', () => ({
  __esModule: true,
  useAuth: jest.fn(),
}))

import PrivateRoute from './PrivateRoute'
import { useAuth } from '../context/useAuth'

const useAuthMock = useAuth as unknown as jest.Mock

describe('PrivateRoute', () => {
  it('shows spinner while bootstrapping', () => {
    useAuthMock.mockReturnValue({ user: null, isBootstrapping: true })

    render(
      <MemoryRouter>
        <PrivateRoute>
          <div>Secret</div>
        </PrivateRoute>
      </MemoryRouter>
    )

    expect(screen.queryByText('Secret')).not.toBeInTheDocument()
  })

  it('redirects to /login when unauthenticated', () => {
    useAuthMock.mockReturnValue({ user: null, isBootstrapping: false })

    render(
      <MemoryRouter initialEntries={['/app']}>
        <PrivateRoute>
          <div>Secret</div>
        </PrivateRoute>
      </MemoryRouter>
    )

    expect(screen.queryByText('Secret')).not.toBeInTheDocument()
  })

  it('renders children when authenticated', () => {
    useAuthMock.mockReturnValue({ user: { id: 1 }, isBootstrapping: false })

    render(
      <MemoryRouter>
        <PrivateRoute>
          <div>Secret</div>
        </PrivateRoute>
      </MemoryRouter>
    )

    expect(screen.getByText('Secret')).toBeInTheDocument()
  })
})