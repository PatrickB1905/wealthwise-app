import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

jest.mock('../components/Sidebar', () => ({
  __esModule: true,
  default: () => <div data-testid="sidebar">Sidebar</div>,
}))

jest.mock('./PositionsPage', () => ({
  __esModule: true,
  default: () => <div>PositionsPage</div>,
}))

jest.mock('./AnalyticsPage', () => ({
  __esModule: true,
  default: () => <div>AnalyticsPage</div>,
}))

jest.mock('./NewsPage', () => ({
  __esModule: true,
  default: () => <div>NewsPage</div>,
}))

jest.mock('./ProfilePage', () => ({
  __esModule: true,
  default: () => <div>ProfilePage</div>,
}))

import DashboardLayout from './DashboardLayout'

describe('DashboardLayout', () => {
  it('redirects /app/ to /app/positions', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <DashboardLayout />
      </MemoryRouter>
    )

    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    expect(screen.getByText('PositionsPage')).toBeInTheDocument()
  })

  it('renders analytics route', () => {
    render(
      <MemoryRouter initialEntries={['/analytics']}>
        <DashboardLayout />
      </MemoryRouter>
    )

    expect(screen.getByText('AnalyticsPage')).toBeInTheDocument()
  })

  it('renders news route', () => {
    render(
      <MemoryRouter initialEntries={['/news']}>
        <DashboardLayout />
      </MemoryRouter>
    )

    expect(screen.getByText('NewsPage')).toBeInTheDocument()
  })

  it('renders profile route', () => {
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <DashboardLayout />
      </MemoryRouter>
    )

    expect(screen.getByText('ProfilePage')).toBeInTheDocument()
  })
})