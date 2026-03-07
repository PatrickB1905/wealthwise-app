import React from 'react';
import dayjs from 'dayjs';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import API from '@shared/lib/axios';
import { usePositionsPage } from './usePositionsPage';

jest.mock('@shared/lib/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('@features/portfolio/hooks/usePositionWS', () => ({
  __esModule: true,
  usePositionWS: jest.fn(),
}));

jest.mock('@features/market-data/hooks/useQuotes', () => ({
  __esModule: true,
  useQuotes: jest.fn(() => ({
    data: [],
    isLoading: false,
  })),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

const mockedApi = API as jest.Mocked<typeof API>;

describe('usePositionsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedApi.get.mockResolvedValue({ data: [] } as never);
    mockedApi.post.mockResolvedValue({
      data: {
        id: 1,
        ticker: 'AAPL',
        quantity: 1,
        buyPrice: 10,
        buyDate: new Date().toISOString(),
      },
    } as never);
    mockedApi.put.mockResolvedValue({ data: {} } as never);
    mockedApi.delete.mockResolvedValue({} as never);
  });

  it('requires a ticker before adding a position', async () => {
    const { result } = renderHook(() => usePositionsPage(false), { wrapper: createWrapper() });

    await waitFor(() => expect(mockedApi.get).toHaveBeenCalled());

    act(() => {
      result.current.openAddDialog();
    });

    act(() => {
      result.current.onAddSubmit();
    });

    await waitFor(() => {
      expect(result.current.tickerError).toBe('Ticker is required');
    });
    expect(mockedApi.post).not.toHaveBeenCalled();
  });

  it('requires quantity before adding a position', async () => {
    const { result } = renderHook(() => usePositionsPage(false), { wrapper: createWrapper() });

    await waitFor(() => expect(mockedApi.get).toHaveBeenCalled());

    act(() => {
      result.current.openAddDialog();
    });

    act(() => {
      result.current.setNewTicker('AAPL');
    });

    act(() => {
      result.current.onAddSubmit();
    });

    await waitFor(() => {
      expect(result.current.quantityError).toBe('Quantity must be greater than 0');
    });
    expect(mockedApi.post).not.toHaveBeenCalled();
  });

  it('requires buy price before adding a position', async () => {
    const { result } = renderHook(() => usePositionsPage(false), { wrapper: createWrapper() });

    await waitFor(() => expect(mockedApi.get).toHaveBeenCalled());

    act(() => {
      result.current.openAddDialog();
    });

    act(() => {
      result.current.setNewTicker('AAPL');
      result.current.setNewQuantity('1');
    });

    act(() => {
      result.current.onAddSubmit();
    });

    await waitFor(() => {
      expect(result.current.buyPriceError).toBe('Buy price is required');
    });
    expect(mockedApi.post).not.toHaveBeenCalled();
  });

  it('rejects a non-positive buy price when adding a position', async () => {
    const { result } = renderHook(() => usePositionsPage(false), { wrapper: createWrapper() });

    await waitFor(() => expect(mockedApi.get).toHaveBeenCalled());

    act(() => {
      result.current.openAddDialog();
    });

    act(() => {
      result.current.setNewTicker('AAPL');
      result.current.setNewQuantity('1');
      result.current.setNewBuyPrice('0');
    });

    act(() => {
      result.current.onAddSubmit();
    });

    await waitFor(() => {
      expect(result.current.buyPriceError).toBe('Buy price must be greater than 0');
    });
    expect(mockedApi.post).not.toHaveBeenCalled();
  });

  it('requires buy date before adding a position and sets inline error', async () => {
    const { result } = renderHook(() => usePositionsPage(false), { wrapper: createWrapper() });

    await waitFor(() => expect(mockedApi.get).toHaveBeenCalled());

    act(() => {
      result.current.openAddDialog();
    });

    act(() => {
      result.current.setNewTicker('AAPL');
      result.current.setNewQuantity('1');
      result.current.setNewBuyPrice('10');
      result.current.setNewBuyDate(null);
    });

    act(() => {
      result.current.onAddSubmit();
    });

    await waitFor(() => {
      expect(result.current.buyDateError).toBe('Buy date is required');
    });
    expect(mockedApi.post).not.toHaveBeenCalled();
  });

  it('requires a valid buy date before adding a position and sets inline error', async () => {
    const { result } = renderHook(() => usePositionsPage(false), { wrapper: createWrapper() });
    const invalidDate = dayjs('not-a-real-date');

    await waitFor(() => expect(mockedApi.get).toHaveBeenCalled());

    act(() => {
      result.current.openAddDialog();
    });

    act(() => {
      result.current.setNewTicker('AAPL');
      result.current.setNewQuantity('1');
      result.current.setNewBuyPrice('10');
      result.current.setNewBuyDate(invalidDate);
    });

    act(() => {
      result.current.onAddSubmit();
    });

    await waitFor(() => {
      expect(result.current.buyDateError).toBe('Enter a valid buy date');
    });
    expect(mockedApi.post).not.toHaveBeenCalled();
  });

  it('allows fractional quantity when the value is greater than 0', async () => {
    const { result } = renderHook(() => usePositionsPage(false), { wrapper: createWrapper() });

    await waitFor(() => expect(mockedApi.get).toHaveBeenCalled());

    act(() => {
      result.current.openAddDialog();
    });

    act(() => {
      result.current.setNewTicker('aapl');
      result.current.setNewQuantity('0.1');
      result.current.setNewBuyPrice('10');
    });

    act(() => {
      result.current.onAddSubmit();
    });

    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalledWith(
        '/positions',
        expect.objectContaining({
          ticker: 'AAPL',
          quantity: 0.1,
          buyPrice: 10,
        }),
      );
    });
  });

  it('requires buy price when editing a position', async () => {
    const { result } = renderHook(() => usePositionsPage(false), { wrapper: createWrapper() });

    await waitFor(() => expect(mockedApi.get).toHaveBeenCalled());

    act(() => {
      result.current.openEditDialog({
        id: 7,
        ticker: 'AAPL',
        quantity: 1,
        buyPrice: 12,
        buyDate: new Date().toISOString(),
      });
    });

    act(() => {
      result.current.setNewBuyPrice('');
    });

    act(() => {
      result.current.onEditSubmit();
    });

    await waitFor(() => {
      expect(result.current.buyPriceError).toBe('Buy price is required');
    });
    expect(mockedApi.put).not.toHaveBeenCalled();
  });

  it('requires buy date when editing a position and sets inline error', async () => {
    const { result } = renderHook(() => usePositionsPage(false), { wrapper: createWrapper() });

    await waitFor(() => expect(mockedApi.get).toHaveBeenCalled());

    act(() => {
      result.current.openEditDialog({
        id: 7,
        ticker: 'AAPL',
        quantity: 1,
        buyPrice: 12,
        buyDate: new Date().toISOString(),
      });
    });

    act(() => {
      result.current.setNewBuyDate(null);
    });

    act(() => {
      result.current.onEditSubmit();
    });

    await waitFor(() => {
      expect(result.current.buyDateError).toBe('Buy date is required');
    });
    expect(mockedApi.put).not.toHaveBeenCalled();
  });

  it('requires a valid buy date when editing a position and sets inline error', async () => {
    const { result } = renderHook(() => usePositionsPage(false), { wrapper: createWrapper() });
    const invalidDate = dayjs('not-a-real-date');

    await waitFor(() => expect(mockedApi.get).toHaveBeenCalled());

    act(() => {
      result.current.openEditDialog({
        id: 7,
        ticker: 'AAPL',
        quantity: 1,
        buyPrice: 12,
        buyDate: new Date().toISOString(),
      });
    });

    act(() => {
      result.current.setNewBuyDate(invalidDate);
    });

    act(() => {
      result.current.onEditSubmit();
    });

    await waitFor(() => {
      expect(result.current.buyDateError).toBe('Enter a valid buy date');
    });
    expect(mockedApi.put).not.toHaveBeenCalled();
  });

  it('requires sell price before closing a position', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          ticker: 'AAPL',
          quantity: 1,
          buyPrice: 10,
          buyDate: new Date().toISOString(),
        },
      ],
    } as never);

    const { result } = renderHook(() => usePositionsPage(false), { wrapper: createWrapper() });

    await waitFor(() => expect(mockedApi.get).toHaveBeenCalled());

    act(() => {
      result.current.openCloseDialog({
        id: 1,
        ticker: 'AAPL',
        quantity: 1,
        buyPrice: 10,
        buyDate: new Date().toISOString(),
      });
    });

    act(() => {
      result.current.setNewSellPrice('');
    });

    act(() => {
      result.current.onCloseSubmit();
    });

    await waitFor(() => {
      expect(result.current.sellPriceError).toBe('Sell price is required');
    });
    expect(mockedApi.put).not.toHaveBeenCalled();
  });

  it('allows zero as a sell price when closing a position', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          ticker: 'AAPL',
          quantity: 1,
          buyPrice: 10,
          buyDate: new Date().toISOString(),
        },
      ],
    } as never);

    const { result } = renderHook(() => usePositionsPage(false), { wrapper: createWrapper() });

    await waitFor(() => expect(mockedApi.get).toHaveBeenCalled());

    act(() => {
      result.current.openCloseDialog({
        id: 1,
        ticker: 'AAPL',
        quantity: 1,
        buyPrice: 10,
        buyDate: new Date().toISOString(),
      });
    });

    act(() => {
      result.current.setNewSellPrice('0');
    });

    act(() => {
      result.current.onCloseSubmit();
    });

    await waitFor(() => {
      expect(mockedApi.put).toHaveBeenCalledWith(
        '/positions/1/close',
        expect.objectContaining({
          sellPrice: 0,
        }),
      );
    });
  });

  it('requires a valid sell date before closing a position', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          ticker: 'AAPL',
          quantity: 1,
          buyPrice: 10,
          buyDate: new Date().toISOString(),
        },
      ],
    } as never);

    const { result } = renderHook(() => usePositionsPage(false), { wrapper: createWrapper() });

    await waitFor(() => expect(mockedApi.get).toHaveBeenCalled());

    act(() => {
      result.current.openCloseDialog({
        id: 1,
        ticker: 'AAPL',
        quantity: 1,
        buyPrice: 10,
        buyDate: new Date().toISOString(),
      });
    });

    act(() => {
      result.current.setNewSellPrice('5');
      result.current.setNewSellDate(null);
    });

    act(() => {
      result.current.onCloseSubmit();
    });

    await waitFor(() => {
      expect(result.current.sellDateError).toBe('Sell date is required');
    });
    expect(mockedApi.put).not.toHaveBeenCalled();
  });
});