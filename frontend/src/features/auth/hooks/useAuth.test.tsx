import { render, screen } from '@testing-library/react';
import { useAuth } from './useAuth';
import { AuthContext, type AuthContextValue } from '../components/authContext';

function Probe() {
  const { user } = useAuth();
  return <div data-testid="email">{user?.email ?? 'none'}</div>;
}

describe('useAuth', () => {
  it('throws if used outside AuthProvider/AuthContext', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<Probe />)).toThrow('useAuth must be used within AuthProvider');

    spy.mockRestore();
  });

  it('returns context value when inside AuthContext.Provider', () => {
    const value: AuthContextValue = {
      user: { id: 1, email: 'pat@example.com', createdAt: new Date().toISOString() },
      isBootstrapping: false,
      login: async () => undefined,
      register: async () => undefined,
      logout: () => undefined,
    };

    render(
      <AuthContext.Provider value={value}>
        <Probe />
      </AuthContext.Provider>,
    );

    expect(screen.getByTestId('email')).toHaveTextContent('pat@example.com');
  });
});
