import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { makeTestQueryClient } from '../test/testQueryClient'

jest.mock('../context/useAuth', () => ({
  __esModule: true,
  useAuth: jest.fn(),
}))

jest.mock('../hooks/usePositionWS', () => ({
  __esModule: true,
  usePositionWS: jest.fn(),
}))

jest.mock('../api/analyticsClient', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))

type ChildrenProps = { children?: React.ReactNode }

jest.mock('recharts', () => ({
  __esModule: true,
  ResponsiveContainer: ({ children }: ChildrenProps) => <div data-testid="chart">{children}</div>,
  LineChart: ({ children }: ChildrenProps) => <div>{children}</div>,
  Line: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
}))

import { useAuth } from '../context/useAuth'
import AnalyticsAPI from '../api/analyticsClient'
import AnalyticsPage from './AnalyticsPage'

type UseAuthReturn = { user: { id: number } | null }
const useAuthMock = useAuth as unknown as jest.MockedFunction<() => UseAuthReturn>

type AnalyticsGet = jest.MockedFunction<
  (url: string, cfg?: { params?: { months?: number; days?: number; benchmark?: string } }) => Promise<{ data: unknown }>
>

const analyticsMock = AnalyticsAPI as unknown as { get: AnalyticsGet }

function renderWithQuery(ui: React.ReactElement) {
  const qc = makeTestQueryClient()
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>)
}

describe('AnalyticsPage', () => {
  beforeEach(() => {
    useAuthMock.mockReturnValue({ user: { id: 1 } })
    analyticsMock.get.mockReset()
  })

  it('shows loading initially', async () => {
    analyticsMock.get.mockImplementation(() => new Promise(() => {}) as Promise<{ data: unknown }>)

    renderWithQuery(
      <MemoryRouter>
        <AnalyticsPage />
      </MemoryRouter>
    )

    expect(await screen.findByRole('progressbar')).toBeInTheDocument()
  })

  it('shows error when a query fails', async () => {
    analyticsMock.get.mockRejectedValueOnce(new Error('boom'))
    renderWithQuery(
      <MemoryRouter>
        <AnalyticsPage />
      </MemoryRouter>
    )

    expect(await screen.findByText('boom')).toBeInTheDocument()
  })

  it('renders metrics + holdings when queries succeed, and range toggle refetches history', async () => {
    const summary = {
      invested: 1000,
      totalPL: 120,
      totalPLPercent: 12,
      openCount: 1,
      closedCount: 2,
    }

    const overview = {
      summary,
      holdings: [
        {
          ticker: 'AAPL',
          quantity: 1.2345,
          avgCost: 100,
          currentPrice: 120,
          marketValue: 148.14,
          unrealizedPL: 20,
          unrealizedPLPercent: 20,
          weight: 50,
        },
      ],
      concentration: { top5WeightPercent: 50, hhi: 0.25 },
    }

    const perf = {
      days: 365,
      points: [{ date: '2025-01-01', portfolioValue: 1000, cumulativeReturnPercent: 0 }],
    }

    const risk = {
      days: 365,
      benchmark: 'SPY',
      volatilityAnnualized: 0.2,
      maxDrawdownPercent: -10,
      sharpeAnnualized: 1.2,
      beta: 0.9,
      correlation: 0.8,
    }

    const history12 = [{ date: '2025-01-01', value: 10 }]
    const history6 = [{ date: '2025-01-01', value: 5 }]

    analyticsMock.get.mockImplementation((url, cfg) => {
      if (url === '/analytics/summary') return Promise.resolve({ data: summary })
      if (url === '/analytics/overview') return Promise.resolve({ data: overview })
      if (url === '/analytics/performance') return Promise.resolve({ data: perf })
      if (url === '/analytics/risk') return Promise.resolve({ data: risk })
      if (url === '/analytics/history') {
        const months = cfg?.params?.months
        return Promise.resolve({ data: months === 6 ? history6 : history12 })
      }
      return Promise.reject(new Error(`unexpected ${url}`))
    })

    renderWithQuery(
      <MemoryRouter>
        <AnalyticsPage />
      </MemoryRouter>
    )

    expect(await screen.findByText(/total money invested/i)).toBeInTheDocument()
    expect(screen.getByText('$1000.00')).toBeInTheDocument()
    expect(screen.getByText(/holdings allocation/i)).toBeInTheDocument()
    expect(screen.getByText('AAPL')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /6 m/i }))

    await waitFor(() => {
      expect(analyticsMock.get).toHaveBeenCalledWith(
        '/analytics/history',
        expect.objectContaining({ params: { months: 6 } })
      )
    })
  })

  it('when user is null, queries are disabled and it shows the “not available yet” message', async () => {
    useAuthMock.mockReturnValue({ user: null })

    renderWithQuery(
      <MemoryRouter>
        <AnalyticsPage />
      </MemoryRouter>
    )

    expect(await screen.findByText(/analytics data is not available yet/i)).toBeInTheDocument()
    expect(analyticsMock.get).not.toHaveBeenCalled()
  })
})