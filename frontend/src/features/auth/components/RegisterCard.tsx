import React from 'react';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';

import { AuthContainer, AuthPaper, FormFooter, FormHeader } from '@shared/ui/layout/Styled';
import { RegisterForm } from './RegisterForm';
import type { UseRegisterPageReturn } from '../hooks/useRegisterPage';

type Props = {
  vm: UseRegisterPageReturn;
};

export const RegisterCard: React.FC<Props> = ({ vm }) => {
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
            Create Your Account
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Create your account to access structured portfolio analytics, performance insights, and
            contextual market intelligence in one unified platform.
          </Typography>
        </FormHeader>

        {vm.error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {vm.error}
          </Alert>
        ) : null}

        <RegisterForm
          firstName={vm.firstName}
          onFirstNameChange={vm.setFirstName}
          firstOk={vm.firstOk}
          lastName={vm.lastName}
          onLastNameChange={vm.setLastName}
          lastOk={vm.lastOk}
          email={vm.email}
          onEmailChange={vm.setEmail}
          emailOk={vm.emailOk}
          password={vm.password}
          onPasswordChange={vm.setPassword}
          passwordOk={vm.passwordOk}
          acceptTerms={vm.acceptTerms}
          onAcceptTermsChange={vm.setAcceptTerms}
          showPassword={vm.showPassword}
          onToggleShowPassword={vm.toggleShowPassword}
          touched={vm.touched}
          onBlur={vm.markTouched}
          submitting={vm.submitting}
          canSubmit={vm.canSubmit}
          onSubmit={vm.handleSubmit}
        />

        <Divider sx={{ my: 2.25 }} />

        <FormFooter>
          <Link component={RouterLink} to="/login" variant="body2">
            Already have an account? Log in
          </Link>
        </FormFooter>
      </AuthPaper>
    </AuthContainer>
  );
};
