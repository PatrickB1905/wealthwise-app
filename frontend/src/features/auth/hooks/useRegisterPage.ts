import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getErrorMessage } from '@shared/lib/http';
import { useAuth } from '@features/auth';
import { REGISTER_SUCCESS_REDIRECT } from '../constants';

function isValidEmail(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function isStrongEnoughPassword(value: string): boolean {
  return value.trim().length >= 8;
}

type Touched = { firstName: boolean; lastName: boolean; email: boolean; password: boolean };

export function useRegisterPage() {
  const { register } = useAuth();
  const nav = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [acceptTerms, setAcceptTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<Touched>({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
  });

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const firstOk = useMemo(() => firstName.trim().length > 0, [firstName]);
  const lastOk = useMemo(() => lastName.trim().length > 0, [lastName]);
  const emailOk = useMemo(() => isValidEmail(email), [email]);
  const passwordOk = useMemo(() => isStrongEnoughPassword(password), [password]);

  const canSubmit = firstOk && lastOk && emailOk && passwordOk && acceptTerms && !submitting;

  const markTouched = (key: keyof Touched) => setTouched((t) => ({ ...t, [key]: true }));

  const toggleShowPassword = () => setShowPassword((s) => !s);

  const goHome = () => nav('/');
  const goLogin = () => nav('/login');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTouched({ firstName: true, lastName: true, email: true, password: true });

    if (!canSubmit) return;

    setSubmitting(true);
    try {
      await register(firstName.trim(), lastName.trim(), email.trim(), password);
      nav(REGISTER_SUCCESS_REDIRECT, { replace: true });
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Registration failed'));
      setSubmitting(false);
    }
  };

  return {
    // Values
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    password,
    setPassword,
    acceptTerms,
    setAcceptTerms,
    showPassword,
    touched,
    error,
    submitting,

    // Derived
    firstOk,
    lastOk,
    emailOk,
    passwordOk,
    canSubmit,

    // Events
    handleSubmit,
    markTouched,
    toggleShowPassword,
    goHome,
    goLogin,
  };
}

export type UseRegisterPageReturn = ReturnType<typeof useRegisterPage>;
