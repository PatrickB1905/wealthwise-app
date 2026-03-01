import { MemoryRouter } from 'react-router-dom'
import { fireEvent, render, screen, within, waitFor } from '@testing-library/react'

jest.mock('../api/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}))

jest.mock('../context/useAuth', () => ({
  __esModule: true,
  useAuth: jest.fn(),
}))

import API from '../api/axios'
import { useAuth } from '../context/useAuth'
import ProfilePage from './ProfilePage'

const useAuthMock = useAuth as unknown as jest.Mock
const apiMock = API as unknown as {
  get: jest.Mock
  put: jest.Mock
  delete: jest.Mock
}

describe('ProfilePage', () => {
  beforeEach(() => {
    useAuthMock.mockReturnValue({ logout: jest.fn() })
    apiMock.get.mockReset()
    apiMock.put.mockReset()
    apiMock.delete.mockReset()
  })

  it('loads and displays profile', async () => {
    apiMock.get.mockResolvedValue({
      data: {
        id: 1,
        firstName: 'Pat',
        lastName: 'Butler',
        email: 'a@b.com',
        createdAt: new Date().toISOString(),
      },
    })

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    )

    expect(await screen.findByText(/my profile/i)).toBeInTheDocument()
    expect(screen.getByText(/pat/i)).toBeInTheDocument()
    expect(screen.getByDisplayValue('a@b.com')).toBeInTheDocument()
  })

  it('updates email and shows success banner', async () => {
    apiMock.get.mockResolvedValue({
      data: {
        id: 1,
        firstName: 'Pat',
        lastName: 'Butler',
        email: 'a@b.com',
        createdAt: new Date().toISOString(),
      },
    })

    apiMock.put.mockResolvedValue({ data: { email: 'new@b.com' } })

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    )

    await screen.findByText(/my profile/i)

    fireEvent.change(screen.getByLabelText(/^email$/i), { target: { value: 'new@b.com' } })
    fireEvent.click(screen.getByRole('button', { name: /update email/i }))

    expect(await screen.findByText(/email updated to new@b\.com/i)).toBeInTheDocument()
  })

  it('changes password and shows success banner', async () => {
    apiMock.get.mockResolvedValue({
      data: {
        id: 1,
        firstName: 'Pat',
        lastName: 'Butler',
        email: 'a@b.com',
        createdAt: new Date().toISOString(),
      },
    })

    apiMock.put.mockResolvedValue({ data: {} })

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    )

    await screen.findByText(/my profile/i)

    fireEvent.change(screen.getByLabelText(/current password/i), { target: { value: 'old' } })
    fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: 'new' } })
    fireEvent.click(screen.getByRole('button', { name: /change password/i }))

    expect(await screen.findByText(/password updated/i)).toBeInTheDocument()
  })

  it('deletes account and calls logout', async () => {
    const logout = jest.fn()
    useAuthMock.mockReturnValue({ logout })

    apiMock.get.mockResolvedValue({
      data: {
        id: 1,
        firstName: 'Pat',
        lastName: 'Butler',
        email: 'a@b.com',
        createdAt: new Date().toISOString(),
      },
    })

    apiMock.delete.mockResolvedValue({})

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    )

    await screen.findByText(/my profile/i)

    fireEvent.click(screen.getByRole('button', { name: /delete account/i }))

    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: /^delete account$/i }))

    expect(apiMock.delete).toHaveBeenCalledWith('/auth/me')

    await screen.findByText(/confirm account deletion/i)
    await Promise.resolve()

    await waitFor(() => expect(logout).toHaveBeenCalled())
  })
})