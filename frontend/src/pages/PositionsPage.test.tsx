import { render, screen, within } from '@testing-library/react'
import API from '../api/axios'
import { makeTestQueryClient, withQueryClient } from '../test/testQueryClient'
import PositionsPage from './PositionsPage'

jest.mock('../hooks/usePositionWS', () => ({
  __esModule: true,
  usePositionWS: () => undefined,
}))

jest.mock('../hooks/useQuotes', () => ({
  __esModule: true,
  useQuotes: () => ({ data: [], isLoading: false }),
}))

jest.mock('../api/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}))

const APIMock = API as unknown as { get: jest.Mock }

describe('PositionsPage', () => {
  beforeEach(() => {
    APIMock.get.mockReset()
  })

  it('shows — for current price and P/L when quote is missing', async () => {
    APIMock.get.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          ticker: 'AAPL',
          quantity: 2,
          buyPrice: 100,
          buyDate: new Date().toISOString(),
        },
      ],
    })

    const qc = makeTestQueryClient()
    render(withQueryClient(<PositionsPage />, qc))

    const row = await screen.findByText('AAPL')
    const tr = row.closest('tr')
    expect(tr).toBeTruthy()

    const cells = within(tr!).getAllByRole('cell')

    expect(cells[1]).toHaveTextContent('$100.00')
    expect(cells[3]).toHaveTextContent('—')
    expect(cells[5]).toHaveTextContent('—')
    expect(cells[6]).toHaveTextContent('—')
  })
})