'use client';
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes';
import type { ReactNode } from 'react';
import { ThemeCtx } from './theme.js';
import type { ThemeAdapter } from './types.js';

function narrow(value: string | undefined): 'light' | 'dark' | 'system' {
  if (value === 'light' || value === 'dark' || value === 'system') return value;
  return 'system';
}

function narrowResolved(value: string | undefined): 'light' | 'dark' {
  return value === 'dark' ? 'dark' : 'light';
}

function NextThemesBridge({ children }: { children: ReactNode }) {
  const { theme, setTheme, resolvedTheme } = useNextTheme();
  const value: ThemeAdapter = {
    theme: narrow(theme),
    setTheme: (t) => setTheme(t),
    resolvedTheme: narrowResolved(resolvedTheme),
  };
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function NextThemesAdapter({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider attribute="class" enableSystem defaultTheme="system">
      <NextThemesBridge>{children}</NextThemesBridge>
    </NextThemesProvider>
  );
}
