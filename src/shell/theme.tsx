'use client';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import type { ThemeAdapter } from './types.js';

const ThemeCtx = createContext<ThemeAdapter | null>(null);

export function DefaultThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const saved = window.localStorage.getItem('meda:theme') as 'light' | 'dark' | 'system' | null;
    if (saved) setThemeState(saved);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const resolved = theme === 'system' ? (mq.matches ? 'dark' : 'light') : theme;
      setResolvedTheme(resolved);
      document.documentElement.classList.toggle('dark', resolved === 'dark');
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [theme]);

  const setTheme = (t: 'light' | 'dark' | 'system') => {
    setThemeState(t);
    window.localStorage.setItem('meda:theme', t);
  };

  return (
    <ThemeCtx.Provider value={{ theme, setTheme, resolvedTheme }}>{children}</ThemeCtx.Provider>
  );
}

export function useTheme(): ThemeAdapter {
  const v = useContext(ThemeCtx);
  if (!v) throw new Error('useTheme must be used inside <MedaShellProvider>');
  return v;
}
