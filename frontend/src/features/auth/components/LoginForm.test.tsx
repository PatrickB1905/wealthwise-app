import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import theme from '@shared/theme';
import { LoginForm } from './LoginForm';

type Overrides = Partial<React.ComponentProps<typeof LoginForm>>;

function TestHarness(props: Overrides) {
  const [email, setEmail] = React.useState(props.email ?? '');
  const [password, setPassword] = React.useState(props.password ?? '');

  return (
    <LoginForm
      email={email}
      onEmailChange={(next) => {
        props.onEmailChange?.(next);
        setEmail(next);
      }}
      onEmailBlur={props.onEmailBlur ?? jest.fn()}
      emailOk={props.emailOk ?? true}
      password={password}
      onPasswordChange={(next) => {
        props.onPasswordChange?.(next);
        setPassword(next);
      }}
      onPasswordBlur={props.onPasswordBlur ?? jest.fn()}
      passwordOk={props.passwordOk ?? true}
      touched={props.touched ?? { email: false, password: false }}
      rememberMe={props.rememberMe ?? true}
      onRememberMeChange={props.onRememberMeChange ?? jest.fn()}
      showPassword={props.showPassword ?? false}
      onToggleShowPassword={props.onToggleShowPassword ?? jest.fn()}
      submitting={props.submitting ?? false}
      canSubmit={props.canSubmit ?? true}
      onSubmit={props.onSubmit ?? jest.fn()}
    />
  );
}

function renderLoginForm(overrides: Overrides = {}) {
  const onEmailChange = (overrides.onEmailChange ?? jest.fn()) as jest.Mock;
  const onPasswordChange = (overrides.onPasswordChange ?? jest.fn()) as jest.Mock;
  const onEmailBlur = (overrides.onEmailBlur ?? jest.fn()) as jest.Mock;
  const onPasswordBlur = (overrides.onPasswordBlur ?? jest.fn()) as jest.Mock;
  const onToggleShowPassword = (overrides.onToggleShowPassword ?? jest.fn()) as jest.Mock;
  const onRememberMeChange = (overrides.onRememberMeChange ?? jest.fn()) as jest.Mock;
  const onSubmit = (overrides.onSubmit ?? jest.fn()) as jest.Mock;

  const utils = render(
    <ThemeProvider theme={theme}>
      <TestHarness
        {...overrides}
        onEmailChange={onEmailChange}
        onPasswordChange={onPasswordChange}
        onEmailBlur={onEmailBlur}
        onPasswordBlur={onPasswordBlur}
        onToggleShowPassword={onToggleShowPassword}
        onRememberMeChange={onRememberMeChange}
        onSubmit={onSubmit}
      />
    </ThemeProvider>,
  );

  return {
    ...utils,
    props: {
      onEmailChange,
      onPasswordChange,
      onEmailBlur,
      onPasswordBlur,
      onToggleShowPassword,
      onRememberMeChange,
      onSubmit,
    },
  };
}

describe('LoginForm', () => {
  it('calls onEmailChange and onPasswordChange when typing', async () => {
    const user = userEvent.setup();
    const { props } = renderLoginForm();

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    await user.type(emailInput, 'pat@example.com');

    expect(emailInput).toHaveValue('pat@example.com');
    expect(props.onEmailChange).toHaveBeenCalled();
    expect(props.onEmailChange).toHaveBeenLastCalledWith('pat@example.com');

    const passwordInput = screen.getByLabelText(/password/i, {
      selector: 'input',
    }) as HTMLInputElement;
    await user.type(passwordInput, 'secret');

    expect(passwordInput).toHaveValue('secret');
    expect(props.onPasswordChange).toHaveBeenCalled();
    expect(props.onPasswordChange).toHaveBeenLastCalledWith('secret');
  });

  it('shows helper text when fields are touched and invalid', () => {
    renderLoginForm({
      touched: { email: true, password: true },
      emailOk: false,
      passwordOk: false,
    });

    expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
  });

  it('calls blur handlers', async () => {
    const user = userEvent.setup();
    const { props } = renderLoginForm();

    await user.click(screen.getByLabelText(/email/i));
    await user.tab();
    expect(props.onEmailBlur).toHaveBeenCalledTimes(1);

    await user.click(screen.getByLabelText(/password/i, { selector: 'input' }));
    await user.tab();
    expect(props.onPasswordBlur).toHaveBeenCalledTimes(1);
  });

  it('toggles show/hide password via icon button', async () => {
    const user = userEvent.setup();
    const { props } = renderLoginForm({ showPassword: false });

    const btn = screen.getByRole('button', { name: /show password/i });
    await user.click(btn);

    expect(props.onToggleShowPassword).toHaveBeenCalledTimes(1);
  });

  it('updates remember me checkbox', async () => {
    const user = userEvent.setup();
    const { props } = renderLoginForm({ rememberMe: false });

    const checkbox = screen.getByRole('checkbox', { name: /remember me/i });
    await user.click(checkbox);

    expect(props.onRememberMeChange).toHaveBeenCalledWith(true);
  });

  it('disables submit when canSubmit is false', () => {
    renderLoginForm({ canSubmit: false });
    expect(screen.getByRole('button', { name: /log in/i })).toBeDisabled();
  });

  it('submits the form', async () => {
    const { props, container } = renderLoginForm({ canSubmit: true });

    const form = container.querySelector('form');
    expect(form).toBeTruthy();

    fireEvent.submit(form as HTMLFormElement);

    expect(props.onSubmit).toHaveBeenCalledTimes(1);
  });
});
