import { fireEvent, render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import dayjs from 'dayjs';

import theme from '@shared/theme';
import { PositionDialogs } from './PositionDialogs';

function baseProps() {
  return {
    tab: 'open' as const,
    selected: null,

    addOpen: true,
    closeOpen: false,
    editOpen: false,
    deleteOpen: false,

    onCloseAdd: jest.fn(),
    onCloseClose: jest.fn(),
    onCloseEdit: jest.fn(),
    onCloseDelete: jest.fn(),

    newTicker: '',
    newQuantity: '',
    newBuyPrice: '',
    newBuyDate: dayjs(),
    newSellPrice: '',
    newSellDate: dayjs(),
    tickerError: '',
    quantityError: '',
    buyPriceError: '',
    buyDateError: '',
    sellPriceError: '',
    sellDateError: '',

    setNewTicker: jest.fn(),
    setNewQuantity: jest.fn(),
    setNewBuyPrice: jest.fn(),
    setNewBuyDate: jest.fn(),
    setNewSellPrice: jest.fn(),
    setNewSellDate: jest.fn(),

    onAddSubmit: jest.fn(),
    onCloseSubmit: jest.fn(),
    onEditSubmit: jest.fn(),
    onDeleteConfirm: jest.fn(),

    isAdding: false,
    isClosing: false,
    isEditing: false,
    isDeleting: false,
  };
}

function renderDialog(overrides: Partial<ReturnType<typeof baseProps>> = {}) {
  return render(
    <ThemeProvider theme={theme}>
      <PositionDialogs {...baseProps()} {...overrides} />
    </ThemeProvider>,
  );
}

describe('PositionDialogs', () => {
  it('renders inline validation messages for ticker, quantity, buy price, and buy date', () => {
    renderDialog({
      tickerError: 'Ticker is required',
      quantityError: 'Quantity must be greater than 0',
      buyPriceError: 'Buy price is required',
      buyDateError: 'Buy date is required',
    });

    expect(screen.getByText('Ticker is required')).toBeInTheDocument();
    expect(screen.getByText('Quantity must be greater than 0')).toBeInTheDocument();
    expect(screen.getByText('Buy price is required')).toBeInTheDocument();
    expect(screen.getByText('Buy date is required')).toBeInTheDocument();
  });

  it('shows tooltip content for ticker, quantity, and buy price', async () => {
    renderDialog();

    const tickerInfoButton = screen.getByRole('button', { name: /ticker info/i });
    fireEvent.mouseOver(tickerInfoButton);
    expect(
      await screen.findByText(/enter the market ticker symbol for this holding/i),
    ).toBeInTheDocument();
    fireEvent.mouseLeave(tickerInfoButton);

    const quantityInfoButton = screen.getByRole('button', { name: /quantity info/i });
    fireEvent.mouseOver(quantityInfoButton);
    expect(
      await screen.findByText(
        /fractional shares are supported, but the quantity must be greater than 0/i,
      ),
    ).toBeInTheDocument();
    fireEvent.mouseLeave(quantityInfoButton);

    const buyPriceInfoButton = screen.getByRole('button', { name: /buy price info/i });
    fireEvent.mouseOver(buyPriceInfoButton);
    expect(
      await screen.findByText(/this value is required and must be greater than 0/i),
    ).toBeInTheDocument();
  });

  it('renders inline validation messages for sell price and sell date in the close dialog', () => {
    render(
      <ThemeProvider theme={theme}>
        <PositionDialogs
          {...baseProps()}
          addOpen={false}
          closeOpen
          selected={{
            id: 1,
            ticker: 'AAPL',
            quantity: 1,
            buyPrice: 10,
            buyDate: new Date().toISOString(),
          }}
          sellPriceError="Sell price is required"
          sellDateError="Sell date is required"
        />
      </ThemeProvider>,
    );

    expect(screen.getByText('Sell price is required')).toBeInTheDocument();
    expect(screen.getByText('Sell date is required')).toBeInTheDocument();
  });

  it('shows tooltip content for sell price and date', async () => {
    render(
      <ThemeProvider theme={theme}>
        <PositionDialogs
          {...baseProps()}
          addOpen={false}
          closeOpen
          selected={{
            id: 1,
            ticker: 'AAPL',
            quantity: 1,
            buyPrice: 10,
            buyDate: new Date().toISOString(),
          }}
        />
      </ThemeProvider>,
    );

    const sellPriceInfoButton = screen.getByRole('button', { name: /sell price info/i });
    fireEvent.mouseOver(sellPriceInfoButton);
    expect(
      await screen.findByText(/zero is allowed if the position became worthless/i),
    ).toBeInTheDocument();
    fireEvent.mouseLeave(sellPriceInfoButton);

    const sellDateInfoButton = screen.getByRole('button', { name: /sell date info/i });
    fireEvent.mouseOver(sellDateInfoButton);
    expect(
      await screen.findByText(/invalid or empty dates are not accepted/i),
    ).toBeInTheDocument();
  });

  it('renders inline validation message for buy date in edit mode', () => {
    renderDialog({
      addOpen: false,
      editOpen: true,
      selected: {
        id: 1,
        ticker: 'AAPL',
        quantity: 1,
        buyPrice: 10,
        buyDate: new Date().toISOString(),
      },
      buyDateError: 'Enter a valid buy date',
    });

    expect(screen.getByText('Enter a valid buy date')).toBeInTheDocument();
  });
});