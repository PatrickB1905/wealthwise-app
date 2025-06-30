import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  email: string;
  createdAt: string;
}

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('ww_token');
    const storedUser = localStorage.getItem('ww_user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await API.post('/auth/login', { email, password });
    const { token, user } = res.data;
    localStorage.setItem('ww_token', token);
    localStorage.setItem('ww_user', JSON.stringify(user));
    setUser(user);
    navigate('/app/positions', { replace: true });
  };

  const register = async (firstName: string, lastName: string, email: string, password: string) => {
    const res = await API.post('/auth/register', { firstName, lastName, email, password });
    const { token, user } = res.data;
    localStorage.setItem('ww_token', token);
    localStorage.setItem('ww_user', JSON.stringify(user));
    setUser(user);
    navigate('/app/positions', { replace: true });
  };

  const logout = () => {
    localStorage.removeItem('ww_token');
    localStorage.removeItem('ww_user');
    setUser(null);
    navigate('/login', { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}