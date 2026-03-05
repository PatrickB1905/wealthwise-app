import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getErrorMessage } from '@shared/lib/http';
import { useAuth } from '@features/auth';
import { LOGIN_SUCCESS_REDIRECT } from '../constants';

function isValidEmail(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

type Touched = { email: boolean; password: boolean };

export function useLoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<Touched>({ email: false, password: false });

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const emailOk = useMemo(() => isValidEmail(email), [email]);
  const passwordOk = useMemo(() => password.trim().length > 0, [password]);
  const canSubmit = emailOk && passwordOk && !submitting;

  const markEmailTouched = () => setTouched((t) => ({ ...t, email: true }));
  const markPasswordTouched = () => setTouched((t) => ({ ...t, password: true }));
  const toggleShowPassword = () => setShowPassword((s) => !s);

  const goHome = () => nav('/');
  const goRegister = () => nav('/register');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setTouched({ email: true, password: true });

    if (!emailOk || !passwordOk) return;

    setSubmitting(true);
    try {
      // rememberMe is reserved for the future here.
      void rememberMe;

      await login(email.trim(), password.trim());
      nav(LOGIN_SUCCESS_REDIRECT, { replace: true });
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Login failed'));
      setSubmitting(false);
    }
  };

  return {
    // Values
    email,
    setEmail,
    password,
    setPassword,
    rememberMe,
    setRememberMe,
    showPassword,
    touched,
    error,
    submitting,

    // Derived
    emailOk,
    passwordOk,
    canSubmit,

    // Events
    handleSubmit,
    markEmailTouched,
    markPasswordTouched,
    toggleShowPassword,
    goHome,
    goRegister,
  };
}

export type UseLoginPageReturn = ReturnType<typeof useLoginPage>;
