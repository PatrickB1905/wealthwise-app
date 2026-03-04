import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from '@shared/theme';
import Sidebar from '../Sidebar';

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true,
}));

const mockLogout = jest.fn();

jest.mock('@features/auth', () => ({
  __esModule: true,
  useAuth: () => ({ logout: mockLogout }),
}));

function renderSidebar(initialPath = '/app/news', onMobileClose = jest.fn()) {
  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="*" element={<Sidebar mobileOpen={false} onMobileClose={onMobileClose} />} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  );
  return { onMobileClose };
}

describe('Sidebar', () => {
  beforeEach(() => {
    mockLogout.mockClear();
  });

  it('renders nav items', () => {
    renderSidebar('/app/positions');

    expect(screen.getByText('Portfolio')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('News')).toBeInTheDocument();
    expect(screen.getByText('My Profile')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('navigates when clicking an item and calls onMobileClose', async () => {
    const user = userEvent.setup();
    const { onMobileClose } = renderSidebar('/app/news');

    await user.click(screen.getByText('Analytics'));

    expect(onMobileClose).toHaveBeenCalledTimes(1);
  });

  it('calls logout and onMobileClose when clicking Logout', async () => {
    const user = userEvent.setup();
    const { onMobileClose } = renderSidebar('/app/news');

    await user.click(screen.getByText('Logout'));

    expect(onMobileClose).toHaveBeenCalledTimes(1);
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
