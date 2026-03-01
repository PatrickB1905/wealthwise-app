import { MemoryRouter } from 'react-router-dom'
import { fireEvent, render, screen } from '@testing-library/react'

jest.mock('../context/useAuth', () => ({
  __esModule: true,
  useAuth: jest.fn(),
}))

import { useAuth } from '../context/useAuth'
import RegisterPage from './RegisterPage'

const useAuthMock = useAuth as unknown as jest.Mock

describe('RegisterPage', () => {
  it('submits fields to register', async () => {
    const register = jest.fn().mockResolvedValue(undefined)
    useAuthMock.mockReturnValue({ register })

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Pat' } })
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Butler' } })
    fireEvent.change(screen.getByLabelText(/^email/i), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pw' } })

    fireEvent.click(screen.getByRole('button', { name: /register/i }))

    expect(register).toHaveBeenCalledWith('Pat', 'Butler', 'a@b.com', 'pw')
  })

  it('shows error message when registration fails', async () => {
    const register = jest.fn().mockRejectedValue({ response: { data: { error: 'Bad' } } })
    useAuthMock.mockReturnValue({ register })

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByRole('button', { name: /register/i }))
    expect(await screen.findByText('Bad')).toBeInTheDocument()
  })
})