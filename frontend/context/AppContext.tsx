"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AppState {
  theme: 'light' | 'dark';
  notifications: string[];
  setTheme: (theme: 'light' | 'dark') => void;
  addNotification: (msg: string) => void;
  clearNotifications: () => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [notifications, setNotifications] = useState<string[]>([]);

  const addNotification = (msg: string) => setNotifications(prev => [...prev, msg]);
  const clearNotifications = () => setNotifications([]);

  return (
    <AppContext.Provider value={{ theme, setTheme, notifications, addNotification, clearNotifications }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
