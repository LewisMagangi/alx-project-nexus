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
  login: (email: string, password: string) => Promise<void>;
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

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await loginApi({ email, password });
      const userData = response.data.user || response.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, username?: string) => {
    setLoading(true);
    try {
      const response = await registerApi({ email, password, username });
      const userData = response.data.user || response.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutApi();
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
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
