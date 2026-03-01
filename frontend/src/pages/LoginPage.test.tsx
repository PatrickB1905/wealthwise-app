import { MemoryRouter } from 'react-router-dom'
import { fireEvent, render, screen } from '@testing-library/react'

jest.mock('../context/useAuth', () => ({
  __esModule: true,
  useAuth: jest.fn(),
}))

import { useAuth } from '../context/useAuth'
import LoginPage from './LoginPage'

const useAuthMock = useAuth as unknown as jest.Mock

describe('LoginPage', () => {
  it('submits email/password to login', async () => {
    const login = jest.fn().mockResolvedValue(undefined)
    useAuthMock.mockReturnValue({ login })

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pw' } })
    fireEvent.click(screen.getByRole('button', { name: /login/i }))

    expect(login).toHaveBeenCalledWith('a@b.com', 'pw')
  })

  it('shows error message when login fails', async () => {
    const login = jest.fn().mockRejectedValue({ response: { data: { error: 'Nope' } } })
    useAuthMock.mockReturnValue({ login })

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pw' } })
    fireEvent.submit(screen.getByRole('button', { name: /login/i }).closest('form')!)

    expect(await screen.findByText('Nope')).toBeInTheDocument()
  })
})