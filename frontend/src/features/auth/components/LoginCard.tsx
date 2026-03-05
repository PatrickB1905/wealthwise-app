import React from 'react';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';

import { AuthContainer, AuthPaper, FormFooter, FormHeader } from '@shared/ui/layout/Styled';
import { LoginForm } from './LoginForm';
import type { UseLoginPageReturn } from '../hooks/useLoginPage';

type Props = {
  vm: UseLoginPageReturn;
};

export const LoginCard: React.FC<Props> = ({ vm }) => {
  return (
    <AuthContainer maxWidth="xs">
      <AuthPaper>
        <FormHeader>
          <Typography
            variant="h5"
            component="h1"
            sx={{ mt: 2, fontWeight: 950, letterSpacing: '-0.03em' }}
            gutterBottom
          >
            Welcome back
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Log in to access your portfolio intelligence, performance analytics, and market insight.
          </Typography>
        </FormHeader>

        {vm.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {vm.error}
          </Alert>
        )}

        <LoginForm
          email={vm.email}
          onEmailChange={vm.setEmail}
          onEmailBlur={vm.markEmailTouched}
          emailOk={vm.emailOk}
          password={vm.password}
          onPasswordChange={vm.setPassword}
          onPasswordBlur={vm.markPasswordTouched}
          passwordOk={vm.passwordOk}
          touched={vm.touched}
          rememberMe={vm.rememberMe}
          onRememberMeChange={vm.setRememberMe}
          showPassword={vm.showPassword}
          onToggleShowPassword={vm.toggleShowPassword}
          submitting={vm.submitting}
          canSubmit={vm.canSubmit}
          onSubmit={vm.handleSubmit}
        />

        <Divider sx={{ my: 2.25 }} />

        <FormFooter>
          <Link component={RouterLink} to="/register" variant="body2">
            Don&apos;t have an account? Create one
          </Link>
        </FormFooter>
      </AuthPaper>
    </AuthContainer>
  );
};
