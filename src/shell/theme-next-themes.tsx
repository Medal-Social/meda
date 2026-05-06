'use client';
import {
  type ReactNode,
  useCallback,
  useEffect,
  useInsertionEffect,
  useMemo,
  useState,
} from 'react';
import { ThemeCtx } from './theme.js';
import type { ThemeAdapter } from './types.js';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'theme';
const MEDIA_QUERY = '(prefers-color-scheme: dark)';
const THEMES: ResolvedTheme[] = ['light', 'dark'];

type LegacyMediaQueryList = MediaQueryList & {
  addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
  removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
};

function narrow(value: string | null | undefined): Theme {
  return value === 'light' || value === 'dark' || value === 'system' ? value : 'system';
}

function getMediaQueryList(): LegacyMediaQueryList | undefined {
  /* v8 ignore next — SSR guard: window is always defined in jsdom test env */
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;
  return window.matchMedia(MEDIA_QUERY) as LegacyMediaQueryList;
}

function resolveSystemTheme(mql?: LegacyMediaQueryList): ResolvedTheme {
  if (mql) return mql.matches ? 'dark' : 'light';
  /* v8 ignore next — null-safe branch: getMediaQueryList() always returns an MQL in jsdom */
  return getMediaQueryList()?.matches ? 'dark' : 'light';
}

function getStoredTheme(): Theme {
  /* v8 ignore next — SSR guard: window is always defined in jsdom test env */
  if (typeof window === 'undefined') return 'system';
  try {
    return narrow(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return 'system';
  }
}

function applyTheme(theme: Theme, resolvedTheme: ResolvedTheme) {
  /* v8 ignore next — SSR guard: document is always defined in jsdom test env */
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const applied = theme === 'system' ? resolvedTheme : theme;
  root.classList.remove(...THEMES);
  root.classList.add(applied);
  root.style.colorScheme = applied;
}

function getClientThemeSnapshot() {
  const theme = getStoredTheme();
  return {
    theme,
    resolvedTheme: theme === 'system' ? resolveSystemTheme() : theme,
  };
}

function subscribeToSystemTheme(
  mql: LegacyMediaQueryList | undefined,
  listener: (event: MediaQueryListEvent) => void
) {
  if (!mql) return () => undefined;
  if (typeof mql.addEventListener === 'function') {
    mql.addEventListener('change', listener);
    return () => mql.removeEventListener('change', listener);
  }
  if (typeof mql.addListener === 'function') {
    mql.addListener(listener);
    return () => mql.removeListener?.(listener);
  }
  return () => undefined;
}

export function NextThemesAdapter({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
  const [hydrated, setHydrated] = useState(false);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    const resolved = next === 'system' ? resolveSystemTheme() : next;
    setResolvedTheme(resolved);
    applyTheme(next, resolved);
    try {
      /* v8 ignore next — SSR guard: window is always defined in jsdom test env */
      if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore unavailable storage, matching next-themes' best-effort behavior.
    }
  }, []);

  useInsertionEffect(() => {
    const snapshot = getClientThemeSnapshot();
    applyTheme(snapshot.theme, snapshot.resolvedTheme);
  }, []);

  useEffect(() => {
    const stored = getClientThemeSnapshot();
    setThemeState(stored.theme);
    setResolvedTheme(stored.resolvedTheme);
    setHydrated(true);
    applyTheme(stored.theme, stored.resolvedTheme);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const mql = getMediaQueryList();

    const sync = (_event?: MediaQueryListEvent) => {
      const resolved = theme === 'system' ? resolveSystemTheme(mql) : theme;
      setResolvedTheme(resolved);
      applyTheme(theme, resolved);
    };

    sync();
    return subscribeToSystemTheme(mql, sync);
  }, [hydrated, theme]);

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
