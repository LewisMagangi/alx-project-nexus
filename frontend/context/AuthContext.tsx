// frontend/context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/services/api';

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // Invalid stored data, clear it
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await authAPI.login({ username, password });
      const { access, user: userData } = response.data;

      localStorage.setItem('token', access);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      router.push('/dashboard');
    } catch (error: unknown) {
      // Safely narrow unknown into the expected shape without using `any`
      let errorMessage = 'Login failed. Please check your credentials.';
      if (typeof error === 'object' && error !== null) {
        const errObj = error as { response?: { data?: unknown } };
        const data = errObj.response?.data;
        if (typeof data === 'object' && data !== null) {
          const d = data as Record<string, unknown>;
          if (typeof d.detail === 'string') {
            errorMessage = d.detail;
          } else if (typeof d.error === 'string') {
            errorMessage = d.error;
          }
        }
      }
      throw new Error(errorMessage);
    }
  };
  const register = async (username: string, email: string, password: string) => {
    try {
      await authAPI.register({ username, email, password, accepted_legal_policies: true });
      // Auto-login after successful registration
      await login(username, password);
    } catch (error: unknown) {
      // Safely narrow unknown into the expected shape without using `any`
      let errorMessage = 'Registration failed. Please try again.';
      if (typeof error === 'object' && error !== null) {
        const errObj = error as { response?: { data?: unknown } };
        const data = errObj.response?.data;
        if (typeof data === 'object' && data !== null) {
          const d = data as Record<string, unknown>;
          if (typeof d.error === 'string') {
            errorMessage = d.error;
          } else if (Array.isArray(d.username) && typeof d.username[0] === 'string') {
            errorMessage = d.username[0] as string;
          } else if (Array.isArray(d.email) && typeof d.email[0] === 'string') {
            errorMessage = d.email[0] as string;
          } else if (Array.isArray(d.password) && typeof d.password[0] === 'string') {
            errorMessage = d.password[0] as string;
          }
        }
      }
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    try {
      authAPI.logout().catch(() => {
        // Ignore errors, logout locally anyway
      });
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      router.push('/auth/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
