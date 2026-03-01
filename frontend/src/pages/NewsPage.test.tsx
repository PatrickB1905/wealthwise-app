import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

jest.mock('../context/useAuth', () => ({
  __esModule: true,
  useAuth: jest.fn(),
}))

jest.mock('../api/axios', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))

jest.mock('../api/newsClient', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))

import { useAuth } from '../context/useAuth'
import API from '../api/axios'
import NewsAPI from '../api/newsClient'
import NewsPage from './NewsPage'

const useAuthMock = useAuth as unknown as jest.Mock
const apiMock = API as unknown as { get: jest.Mock }
const newsMock = NewsAPI as unknown as { get: jest.Mock }

describe('NewsPage', () => {
  beforeEach(() => {
    useAuthMock.mockReturnValue({ user: { id: 1 } })
    apiMock.get.mockReset()
    newsMock.get.mockReset()
  })

  it('shows no positions state when /positions returns empty', async () => {
    apiMock.get.mockResolvedValue({ data: [] })

    render(
      <MemoryRouter>
        <NewsPage />
      </MemoryRouter>
    )

    const matches = await screen.findAllByText(/no open positions/i)
    expect(matches.length).toBeGreaterThan(0)

    expect(apiMock.get).toHaveBeenCalledWith('/positions?status=open')
    expect(newsMock.get).not.toHaveBeenCalled()
  })

  it('renders articles when positions exist and /news returns data', async () => {
    apiMock.get.mockResolvedValue({ data: [{ ticker: 'AAPL' }, { ticker: 'TSLA' }] })
    newsMock.get.mockResolvedValue({
      data: [
        {
          title: 'Apple headline',
          source: 'NewsSource',
          url: 'https://example.com/a',
          publishedAt: new Date('2025-01-01').toISOString(),
        },
      ],
    })

    render(
      <MemoryRouter>
        <NewsPage />
      </MemoryRouter>
    )

    expect(await screen.findByText(/latest news for your open positions/i)).toBeInTheDocument()
    expect(await screen.findByText('Apple headline')).toBeInTheDocument()

    expect(newsMock.get).toHaveBeenCalledWith('/news', { params: { symbols: 'AAPL,TSLA' } })
  })

  it('shows error when any request fails', async () => {
    apiMock.get.mockRejectedValue(new Error('fail'))

    render(
      <MemoryRouter>
        <NewsPage />
      </MemoryRouter>
    )

    expect(await screen.findByText(/failed to load news/i)).toBeInTheDocument()
  })

  it('handles unmount without setting state (active guard)', async () => {
    apiMock.get.mockResolvedValue({ data: [{ ticker: 'AAPL' }] })

    newsMock.get.mockImplementation(() => new Promise(() => {}))

    const { unmount } = render(
      <MemoryRouter>
        <NewsPage />
      </MemoryRouter>
    )

    await waitFor(() => expect(apiMock.get).toHaveBeenCalled())

    expect(() => unmount()).not.toThrow()
  })
})