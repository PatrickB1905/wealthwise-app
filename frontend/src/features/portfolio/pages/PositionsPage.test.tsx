import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import theme from '@shared/theme';
import PositionsPage from './PositionsPage';

type UsePositionsPageVm = Record<string, unknown>;

const mockUsePositionsPage = jest.fn<UsePositionsPageVm, []>();

jest.mock('../hooks/usePositionsPage', () => ({
  __esModule: true,
  usePositionsPage: () => mockUsePositionsPage(),
}));

const mockUseMediaQuery = jest.fn<boolean, []>(() => false);
jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => mockUseMediaQuery(),
}));

jest.mock('../components/PositionsKpis', () => ({
  __esModule: true,
  PositionsKpis: () => <div>PositionsKpis</div>,
}));
jest.mock('../components/PositionsEmptyState', () => ({
  __esModule: true,
  PositionsEmptyState: () => <div>PositionsEmptyState</div>,
}));
jest.mock('../components/PositionsSkeletonTable', () => ({
  __esModule: true,
  PositionsSkeletonTable: () => <div>PositionsSkeletonTable</div>,
}));
jest.mock('../components/PositionsMobileList', () => ({
  __esModule: true,
  PositionsMobileList: () => <div>PositionsMobileList</div>,
}));
jest.mock('../components/PositionsDesktopTable', () => ({
  __esModule: true,
  PositionsDesktopTable: () => <div>PositionsDesktopTable</div>,
}));
jest.mock('../components/PositionsTotalsCard', () => ({
  __esModule: true,
  PositionsTotalsCard: () => <div>PositionsTotalsCard</div>,
}));
jest.mock('../components/PositionDialogs', () => ({
  __esModule: true,
  PositionDialogs: () => <div>PositionDialogs</div>,
}));
jest.mock('../components/PositionsToast', () => ({
  __esModule: true,
  PositionsToast: () => <div>PositionsToast</div>,
}));

function renderPage() {
  return render(
    <ThemeProvider theme={theme}>
      <PositionsPage />
    </ThemeProvider>,
  );
}

type VmOverrides = Partial<Record<string, unknown>>;

function baseVm(overrides: VmOverrides = {}): UsePositionsPageVm {
  return {
    tab: 'open',
    setTab: jest.fn(),

    positions: [],
    quotesMap: {},
    loading: false,
    errorText: undefined,

    pricing: {
      totalInvested: 0,
      totalProfitKnown: 0,
      totalProfitPctKnown: 0,
      missingQuotes: 0,
    },
    totalsProfitTone: 'neutral',
    totalsPctTone: 'neutral',
    headerSubtitle: 'hdr',
    listSubtitle: 'list',
    showQuoteAlert: false,
    isMobile: false,

    addOpen: false,
    closeOpen: false,
    editOpen: false,
    deleteOpen: false,
    selected: null,

    newTicker: '',
    newQuantity: '',
    newBuyPrice: '',
    newBuyDate: null,
    newSellPrice: '',
    newSellDate: null,
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

    openAddDialog: jest.fn(),
    openCloseDialog: jest.fn(),
    openEditDialog: jest.fn(),
    openDeleteDialog: jest.fn(),
    closeAddDialog: jest.fn(),
    closeCloseDialog: jest.fn(),
    closeEditDialog: jest.fn(),
    closeDeleteDialog: jest.fn(),

    onAddSubmit: jest.fn(),
    onCloseSubmit: jest.fn(),
    onEditSubmit: jest.fn(),
    onDeleteConfirm: jest.fn(),

    isAdding: false,
    isClosing: false,
    isEditing: false,
    isDeleting: false,

    toast: { open: false, message: '', severity: 'success' },
    closeToast: jest.fn(),

    ...overrides,
  };
}

describe('PositionsPage', () => {
  beforeEach(() => {
    mockUsePositionsPage.mockReset();
    mockUseMediaQuery.mockReset();
    mockUseMediaQuery.mockReturnValue(false);
  });

  it('renders skeleton when loading', () => {
    mockUsePositionsPage.mockReturnValue(baseVm({ loading: true }));

    renderPage();
    expect(screen.getByText('PositionsSkeletonTable')).toBeInTheDocument();
  });

  it('renders error alert when errorText exists', () => {
    mockUsePositionsPage.mockReturnValue(baseVm({ errorText: 'boom' }));

    renderPage();
    expect(screen.getByText('boom')).toBeInTheDocument();
  });

  it('renders empty state when no positions', () => {
    mockUsePositionsPage.mockReturnValue(baseVm({ positions: [], loading: false }));

    renderPage();
    expect(screen.getByText('PositionsEmptyState')).toBeInTheDocument();
  });

  it('renders desktop table when positions exist and not mobile', () => {
    mockUsePositionsPage.mockReturnValue(
      baseVm({ positions: [{ id: 1, ticker: 'AAPL' }], isMobile: false }),
    );

    renderPage();
    expect(screen.getByText('PositionsDesktopTable')).toBeInTheDocument();
  });

  it('renders mobile list + totals when mobile', () => {
    mockUsePositionsPage.mockReturnValue(
      baseVm({ positions: [{ id: 1, ticker: 'AAPL' }], isMobile: true }),
    );

    renderPage();
    expect(screen.getByText('PositionsMobileList')).toBeInTheDocument();
    expect(screen.getByText('PositionsTotalsCard')).toBeInTheDocument();
  });

  it('shows quote info alert when missingQuotes > 0 and showQuoteAlert is true (open tab)', () => {
    mockUsePositionsPage.mockReturnValue(
      baseVm({
        tab: 'open',
        showQuoteAlert: true,
        pricing: {
          totalInvested: 0,
          totalProfitKnown: 0,
          totalProfitPctKnown: 0,
          missingQuotes: 2,
        },
        positions: [{ id: 1, ticker: 'AAPL' }],
      }),
    );

    renderPage();
    expect(screen.getByText(/we’re still fetching live quotes/i)).toBeInTheDocument();
  });

  it('clicking tab buttons calls setTab', async () => {
    const user = userEvent.setup();
    const setTab = jest.fn();

    mockUsePositionsPage.mockReturnValue(baseVm({ setTab, tab: 'open' }));

    renderPage();
    await user.click(screen.getByRole('button', { name: /closed/i }));
    expect(setTab).toHaveBeenCalledWith('closed');
  });

  it('clicking "Add Position" calls openAddDialog (open tab)', async () => {
    const user = userEvent.setup();
    const openAddDialog = jest.fn();

    mockUsePositionsPage.mockReturnValue(baseVm({ tab: 'open', openAddDialog }));

    renderPage();
    await user.click(screen.getByRole('button', { name: /add position/i }));
    expect(openAddDialog).toHaveBeenCalledTimes(1);
  });
});
