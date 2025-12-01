"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as loginApi, register as registerApi, logout as logoutApi } from '../services/auth';

interface User {
  id: string;
  email: string;
  username?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (email: string, password: string, username?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Optionally, load user from localStorage or validate token with backend
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const response = await loginApi({ username, password });
      const userData = response.data.user || response.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      // Store JWT access token
      if (response.data.access) {
        localStorage.setItem('token', response.data.access);
      }
      if (response.data.refresh) {
        localStorage.setItem('refreshToken', response.data.refresh);
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, username?: string) => {
    setLoading(true);
    try {
      const response = await registerApi({ email, password, username, accepted_legal_policies: true });
      const userData = response.data.user || response.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      // Store JWT access token if provided
      if (response.data.access) {
        localStorage.setItem('token', response.data.access);
      }
      if (response.data.refresh) {
        localStorage.setItem('refreshToken', response.data.refresh);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutApi();
    } catch {
      // Ignore logout errors - we still want to clear local state
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
