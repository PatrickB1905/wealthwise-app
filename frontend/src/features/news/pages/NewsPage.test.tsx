import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import NewsPage from './NewsPage';

type Article = { title: string };

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  disabled?: boolean;
  action?: React.ReactNode;
};

type ErrorStateProps = {
  message: string;
  onRefresh: () => void;
  isRefreshing: boolean;
};

type StickyRefreshProps = {
  onRefresh: () => void;
  isRefreshing: boolean;
};

type UseNewsPageVm = {
  user: { id: number } | null;
  positionsQuery: { isLoading: boolean; error: unknown | null };
  newsQuery: { isLoading: boolean; error: unknown | null };
  positions: Array<{ ticker: string }>;
  tickers: string[];
  symbols: string;
  articles: Article[];
  updatedLabel: string;
  isRefreshing: boolean;
  handleRefresh: () => Promise<void> | void;
};

const mockUseNewsPage = jest.fn<UseNewsPageVm, []>();

jest.mock('../hooks/useNewsPage', () => ({
  __esModule: true,
  useNewsPage: () => mockUseNewsPage(),
}));

jest.mock('../components/NewsLoading', () => ({
  __esModule: true,
  default: () => <div>NewsLoading</div>,
}));
jest.mock('../components/NewsHeader', () => ({
  __esModule: true,
  default: () => <div>NewsHeader</div>,
}));
jest.mock('../components/NewsArticles', () => ({
  __esModule: true,
  default: ({ articles }: { articles: Article[] }) => <div>NewsArticles:{articles.length}</div>,
}));
jest.mock('../components/NewsEmptyState', () => ({
  __esModule: true,
  default: (props: EmptyStateProps) => (
    <div>
      <div>{props.title}</div>
      <div>{props.description}</div>
      {props.actionLabel ? (
        <button onClick={props.onAction} disabled={props.disabled}>
          {props.actionLabel}
        </button>
      ) : null}
      {props.action ? <div>ActionSlot</div> : null}
    </div>
  ),
}));
jest.mock('../components/NewsErrorState', () => ({
  __esModule: true,
  default: (props: ErrorStateProps) => (
    <div>
      <div>NewsError:{props.message}</div>
      <button onClick={props.onRefresh} disabled={props.isRefreshing}>
        Refresh
      </button>
    </div>
  ),
}));
jest.mock('../components/NewsMobileStickyRefresh', () => ({
  __esModule: true,
  default: (props: StickyRefreshProps) => (
    <button onClick={props.onRefresh} disabled={props.isRefreshing}>
      StickyRefresh
    </button>
  ),
}));

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/app/news']}>
      <NewsPage />
    </MemoryRouter>,
  );
}

describe('NewsPage', () => {
  beforeEach(() => {
    mockUseNewsPage.mockReset();
  });

  it('shows info alert when not logged in', () => {
    mockUseNewsPage.mockReturnValue({
      user: null,
      positionsQuery: { isLoading: false, error: null },
      newsQuery: { isLoading: false, error: null },
      positions: [],
      tickers: [],
      symbols: '',
      articles: [],
      updatedLabel: '—',
      isRefreshing: false,
      handleRefresh: jest.fn(),
    });

    renderPage();
    expect(screen.getByText(/please log in to view your portfolio news/i)).toBeInTheDocument();
  });

  it('shows spinner while positions are loading', () => {
    mockUseNewsPage.mockReturnValue({
      user: { id: 1 },
      positionsQuery: { isLoading: true, error: null },
      newsQuery: { isLoading: false, error: null },
      positions: [],
      tickers: [],
      symbols: '',
      articles: [],
      updatedLabel: '—',
      isRefreshing: false,
      handleRefresh: jest.fn(),
    });

    renderPage();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows positions error', () => {
    mockUseNewsPage.mockReturnValue({
      user: { id: 1 },
      positionsQuery: { isLoading: false, error: new Error('Positions failed') },
      newsQuery: { isLoading: false, error: null },
      positions: [],
      tickers: [],
      symbols: '',
      articles: [],
      updatedLabel: '—',
      isRefreshing: false,
      handleRefresh: jest.fn(),
    });

    renderPage();
    expect(screen.getByText('Positions failed')).toBeInTheDocument();
  });

  it('shows empty state when there are no open positions', () => {
    mockUseNewsPage.mockReturnValue({
      user: { id: 1 },
      positionsQuery: { isLoading: false, error: null },
      newsQuery: { isLoading: false, error: null },
      positions: [],
      tickers: [],
      symbols: '',
      articles: [],
      updatedLabel: '—',
      isRefreshing: false,
      handleRefresh: jest.fn(),
    });

    renderPage();
    expect(screen.getByText('No open positions')).toBeInTheDocument();
    expect(screen.getByText(/add positions to your portfolio/i)).toBeInTheDocument();
    expect(screen.getByText('ActionSlot')).toBeInTheDocument();
  });

  it('shows loading state when news is loading', () => {
    mockUseNewsPage.mockReturnValue({
      user: { id: 1 },
      positionsQuery: { isLoading: false, error: null },
      newsQuery: { isLoading: true, error: null },
      positions: [{ ticker: 'AAPL' }],
      tickers: ['AAPL'],
      symbols: 'AAPL',
      articles: [],
      updatedLabel: '1m ago',
      isRefreshing: false,
      handleRefresh: jest.fn(),
    });

    renderPage();
    expect(screen.getByText('NewsLoading')).toBeInTheDocument();
  });

  it('shows error state when news fails and refresh calls handleRefresh', async () => {
    const user = userEvent.setup();
    const refresh = jest.fn();

    mockUseNewsPage.mockReturnValue({
      user: { id: 1 },
      positionsQuery: { isLoading: false, error: null },
      newsQuery: { isLoading: false, error: new Error('News failed') },
      positions: [{ ticker: 'AAPL' }],
      tickers: ['AAPL'],
      symbols: 'AAPL',
      articles: [],
      updatedLabel: '—',
      isRefreshing: false,
      handleRefresh: refresh,
    });

    renderPage();
    expect(screen.getByText('NewsError:News failed')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /refresh/i }));
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('shows empty headlines state when there are no articles and refresh works', async () => {
    const user = userEvent.setup();
    const refresh = jest.fn();

    mockUseNewsPage.mockReturnValue({
      user: { id: 1 },
      positionsQuery: { isLoading: false, error: null },
      newsQuery: { isLoading: false, error: null },
      positions: [{ ticker: 'AAPL' }],
      tickers: ['AAPL'],
      symbols: 'AAPL',
      articles: [],
      updatedLabel: '—',
      isRefreshing: false,
      handleRefresh: refresh,
    });

    renderPage();
    expect(screen.getByText('No headlines available')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Refresh' }));
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('renders articles list when articles exist', () => {
    mockUseNewsPage.mockReturnValue({
      user: { id: 1 },
      positionsQuery: { isLoading: false, error: null },
      newsQuery: { isLoading: false, error: null },
      positions: [{ ticker: 'AAPL' }],
      tickers: ['AAPL'],
      symbols: 'AAPL',
      articles: [{ title: 't1' }, { title: 't2' }],
      updatedLabel: '—',
      isRefreshing: false,
      handleRefresh: jest.fn(),
    });

    renderPage();
    expect(screen.getByText('NewsArticles:2')).toBeInTheDocument();
  });
});
