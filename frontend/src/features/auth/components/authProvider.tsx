import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import API from '@shared/lib/axios';
import { AUTH_EVENTS } from '@shared/lib/http';
import { STORAGE_KEYS } from '@shared/lib/env';
import { resetSocket } from '@shared/lib/socket';

import { AuthContext, type AuthContextValue, type User } from './authContext';

type AuthProviderProps = {
  children: React.ReactNode;
};

type LoginResponse = {
  token: string;
  user: User;
};

type MeResponse = User;

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function clearAuthStorage() {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
}

function persistAuth(token: string, user: User) {
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(() =>
    safeJsonParse<User>(localStorage.getItem(STORAGE_KEYS.USER)),
  );
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const clearAuthState = useCallback(() => {
    clearAuthStorage();
    resetSocket();
    setUser(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) {
      setIsBootstrapping(false);
      return;
    }

    API.get<MeResponse>('/auth/me')
      .then((res) => {
        setUser(res.data);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(res.data));
      })
      .catch(() => {
        clearAuthState();
      })
      .finally(() => {
        setIsBootstrapping(false);
      });
  }, [clearAuthState]);

  useEffect(() => {
    const onUnauthorized = () => {
      clearAuthState();

      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register') {
        navigate('/login', { replace: true });
      }
    };

    window.addEventListener(AUTH_EVENTS.UNAUTHORIZED, onUnauthorized);
    return () => window.removeEventListener(AUTH_EVENTS.UNAUTHORIZED, onUnauthorized);
  }, [clearAuthState, navigate]);

  const login: AuthContextValue['login'] = useCallback(async (email, password) => {
    const res = await API.post<LoginResponse>('/auth/login', { email, password });
    const { token, user } = res.data;

    persistAuth(token, user);
    resetSocket();
    setUser(user);
  }, []);

  const register: AuthContextValue['register'] = useCallback(
    async (firstName, lastName, email, password) => {
      const res = await API.post<LoginResponse>('/auth/register', {
        firstName,
        lastName,
        email,
        password,
      });
      const { token, user } = res.data;

      persistAuth(token, user);
      resetSocket();
      setUser(user);
    },
    [],
  );

  const logout: AuthContextValue['logout'] = useCallback(() => {
    clearAuthState();
    navigate('/login', { replace: true });
  }, [clearAuthState, navigate]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isBootstrapping, login, register, logout }),
    [user, isBootstrapping, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
