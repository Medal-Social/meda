'use client';
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { ThemeCtx } from './theme.js';
import type { ThemeAdapter } from './types.js';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'theme';
const MEDIA_QUERY = '(prefers-color-scheme: dark)';
const THEMES: ResolvedTheme[] = ['light', 'dark'];

function narrow(value: string | null | undefined): Theme {
  return value === 'light' || value === 'dark' || value === 'system' ? value : 'system';
}

function resolveSystemTheme(mql?: MediaQueryList): ResolvedTheme {
  if (mql) return mql.matches ? 'dark' : 'light';
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'light';
  return window.matchMedia(MEDIA_QUERY).matches ? 'dark' : 'light';
}

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  try {
    return narrow(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return 'system';
  }
}

function applyTheme(theme: Theme, resolvedTheme: ResolvedTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const applied = theme === 'system' ? resolvedTheme : theme;
  root.classList.remove(...THEMES);
  root.classList.add(applied);
  root.style.colorScheme = applied;
}

export function NextThemesAdapter({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    theme === 'system' ? resolveSystemTheme() : theme
  );

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore unavailable storage, matching next-themes' best-effort behavior.
    }
  }, []);

  useEffect(() => {
    const mql =
      typeof window.matchMedia === 'function' ? window.matchMedia(MEDIA_QUERY) : undefined;

    const sync = () => {
      const resolved = theme === 'system' ? resolveSystemTheme(mql) : theme;
      setResolvedTheme(resolved);
      applyTheme(theme, resolved);
    };

    sync();
    mql?.addEventListener('change', sync);
    return () => mql?.removeEventListener('change', sync);
  }, [theme]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      setThemeState(narrow(event.newValue));
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const value = useMemo<ThemeAdapter>(
    () => ({
      theme,
      setTheme,
      resolvedTheme,
    }),
    [theme, setTheme, resolvedTheme]
  );

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}
