import React from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { FormButton } from '@shared/ui/layout/Styled';

type Touched = { firstName: boolean; lastName: boolean; email: boolean; password: boolean };

type Props = {
  firstName: string;
  onFirstNameChange: (next: string) => void;
  firstOk: boolean;

  lastName: string;
  onLastNameChange: (next: string) => void;
  lastOk: boolean;

  email: string;
  onEmailChange: (next: string) => void;
  emailOk: boolean;

  password: string;
  onPasswordChange: (next: string) => void;
  passwordOk: boolean;

  acceptTerms: boolean;
  onAcceptTermsChange: (next: boolean) => void;

  showPassword: boolean;
  onToggleShowPassword: () => void;

  touched: Touched;
  onBlur: (key: keyof Touched) => void;

  submitting: boolean;
  canSubmit: boolean;
  onSubmit: (e: React.FormEvent) => void;
};

export const RegisterForm: React.FC<Props> = (props) => {
  const {
    firstName,
    onFirstNameChange,
    firstOk,
    lastName,
    onLastNameChange,
    lastOk,
    email,
    onEmailChange,
    emailOk,
    password,
    onPasswordChange,
    passwordOk,
    acceptTerms,
    onAcceptTermsChange,
    showPassword,
    onToggleShowPassword,
    touched,
    onBlur,
    submitting,
    canSubmit,
    onSubmit,
  } = props;

  return (
    <form noValidate onSubmit={onSubmit}>
      <TextField
        fullWidth
        label="First name"
        required
        margin="normal"
        value={firstName}
        onChange={(e) => onFirstNameChange(e.target.value)}
        onBlur={() => onBlur('firstName')}
        autoComplete="given-name"
        disabled={submitting}
        error={touched.firstName && !firstOk}
        helperText={touched.firstName && !firstOk ? 'First name is required.' : ' '}
      />

      <TextField
        fullWidth
        label="Last name"
        required
        margin="normal"
        value={lastName}
        onChange={(e) => onLastNameChange(e.target.value)}
        onBlur={() => onBlur('lastName')}
        autoComplete="family-name"
        disabled={submitting}
        error={touched.lastName && !lastOk}
        helperText={touched.lastName && !lastOk ? 'Last name is required.' : ' '}
      />

      <TextField
        fullWidth
        label="Email"
        type="email"
        required
        margin="normal"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        onBlur={() => onBlur('email')}
        autoComplete="email"
        disabled={submitting}
        error={touched.email && !emailOk}
        helperText={touched.email && !emailOk ? 'Please enter a valid email address.' : ' '}
      />

      <TextField
        fullWidth
        label="Password"
        type={showPassword ? 'text' : 'password'}
        required
        margin="normal"
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
        onBlur={() => onBlur('password')}
        autoComplete="new-password"
        disabled={submitting}
        error={touched.password && !passwordOk}
        helperText={touched.password && !passwordOk ? 'Use at least 8 characters.' : ' '}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                edge="end"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={onToggleShowPassword}
                disabled={submitting}
              >
                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Box sx={{ mt: 0.5 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={acceptTerms}
              onChange={(e) => onAcceptTermsChange(e.target.checked)}
              disabled={submitting}
            />
          }
          label={
            <Typography variant="body2" color="text.secondary">
              I agree to the Terms &amp; Privacy Policy
            </Typography>
          }
        />
      </Box>

      <FormButton type="submit" fullWidth variant="contained" disabled={!canSubmit}>
        {submitting ? 'Creating account…' : 'Create account'}
      </FormButton>
    </form>
  );
};
