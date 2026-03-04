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

type Props = {
  email: string;
  onEmailChange: (next: string) => void;
  onEmailBlur: () => void;
  emailOk: boolean;

  password: string;
  onPasswordChange: (next: string) => void;
  onPasswordBlur: () => void;
  passwordOk: boolean;

  touched: { email: boolean; password: boolean };

  rememberMe: boolean;
  onRememberMeChange: (next: boolean) => void;

  showPassword: boolean;
  onToggleShowPassword: () => void;

  submitting: boolean;
  canSubmit: boolean;

  onSubmit: (e: React.FormEvent) => void;
};

export const LoginForm: React.FC<Props> = (props) => {
  const {
    email,
    onEmailChange,
    onEmailBlur,
    emailOk,
    password,
    onPasswordChange,
    onPasswordBlur,
    passwordOk,
    touched,
    rememberMe,
    onRememberMeChange,
    showPassword,
    onToggleShowPassword,
    submitting,
    canSubmit,
    onSubmit,
  } = props;

  return (
    <form noValidate onSubmit={onSubmit}>
      <TextField
        fullWidth
        label="Email"
        type="email"
        required
        margin="normal"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        onBlur={onEmailBlur}
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
        onBlur={onPasswordBlur}
        autoComplete="current-password"
        disabled={submitting}
        error={touched.password && !passwordOk}
        helperText={touched.password && !passwordOk ? 'Password is required.' : ' '}
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

      <Box
        sx={{
          mt: 0.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={rememberMe}
              onChange={(e) => onRememberMeChange(e.target.checked)}
              disabled={submitting}
            />
          }
          label={<Typography variant="body2">Remember me</Typography>}
        />

        <Typography variant="body2" color="text.secondary">
          Secure login
        </Typography>
      </Box>

      <FormButton type="submit" fullWidth variant="contained" disabled={!canSubmit}>
        {submitting ? 'Logging in…' : 'Log in'}
      </FormButton>
    </form>
  );
};
