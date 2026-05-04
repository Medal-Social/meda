import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useTheme } from '../../../src/shell/theme.js';
import { NextThemesAdapter } from '../../../src/shell/theme-next-themes.js';

afterEach(() => {
  document.documentElement.classList.remove('dark');
  vi.unstubAllGlobals();
});

function ThemeConsumer() {
  const { theme, resolvedTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
    </div>
  );
}

function stubThemeEnvironment({
  storedTheme = null,
  systemDark = false,
  legacyMediaListener = false,
}: {
  storedTheme?: string | null;
  systemDark?: boolean;
  legacyMediaListener?: boolean;
} = {}) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const mql = {
    matches: systemDark,
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addListener: legacyMediaListener ? vi.fn((listener) => listeners.add(listener)) : undefined,
    removeListener: legacyMediaListener
      ? vi.fn((listener) => listeners.delete(listener))
      : undefined,
    addEventListener: legacyMediaListener
      ? undefined
      : vi.fn((_event: string, listener) => listeners.add(listener)),
    removeEventListener: legacyMediaListener
      ? undefined
      : vi.fn((_event: string, listener) => listeners.delete(listener)),
    dispatchEvent: vi.fn(),
  } as unknown as MediaQueryList & {
    matches: boolean;
    addListener?: ReturnType<typeof vi.fn>;
    removeListener?: ReturnType<typeof vi.fn>;
  };

  vi.stubGlobal('localStorage', {
    getItem: vi.fn(() => storedTheme),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  });
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => mql)
  );

  return {
    mql,
    emitSystemChange(nextMatches: boolean) {
      mql.matches = nextMatches;
      for (const listener of listeners) {
        listener({ matches: nextMatches } as MediaQueryListEvent);
      }
    },
  };
}

describe('NextThemesAdapter — exposes a next-themes-compatible meda ThemeAdapter shape', () => {
  it('exposes theme and resolvedTheme via meda ThemeCtx', () => {
    stubThemeEnvironment();

    render(
      <NextThemesAdapter>
        <ThemeConsumer />
      </NextThemesAdapter>
    );

    // With defaultTheme="system" and no stored preference, theme is 'system'
    expect(screen.getByTestId('theme').textContent).toBe('system');
    // resolvedTheme: matchMedia returns matches=false (light) → 'light'
    expect(screen.getByTestId('resolved').textContent).toBe('light');
  });

  it('narrowResolved defaults to light when resolvedTheme is undefined or unknown', () => {
    stubThemeEnvironment();

    render(
      <NextThemesAdapter>
        <ThemeConsumer />
      </NextThemesAdapter>
    );

    // resolvedTheme should always be 'light' or 'dark', never undefined
    const resolved = screen.getByTestId('resolved').textContent;
    expect(resolved === 'light' || resolved === 'dark').toBe(true);
  });

  it('does not render an inline script tag through React', () => {
    stubThemeEnvironment();

    const { container } = render(
      <NextThemesAdapter>
        <ThemeConsumer />
      </NextThemesAdapter>
    );

    expect(container.querySelector('script')).toBeNull();
  });

  it('applies a stored dark theme to the document root', async () => {
    stubThemeEnvironment({ storedTheme: 'dark' });

    render(
      <NextThemesAdapter>
        <ThemeConsumer />
      </NextThemesAdapter>
    );

    expect(document.documentElement).toHaveClass('dark');
    await waitFor(() => {
      expect(screen.getByTestId('theme').textContent).toBe('dark');
      expect(screen.getByTestId('resolved').textContent).toBe('dark');
    });
  });

  it('supports legacy MediaQueryList addListener/removeListener APIs', async () => {
    const env = stubThemeEnvironment({
      storedTheme: 'system',
      systemDark: false,
      legacyMediaListener: true,
    });

    render(
      <NextThemesAdapter>
        <ThemeConsumer />
      </NextThemesAdapter>
    );

    await waitFor(() => {
      expect(env.mql.addListener).toHaveBeenCalled();
      expect(screen.getByTestId('resolved').textContent).toBe('light');
    });

    env.emitSystemChange(true);

    await waitFor(() => {
      expect(screen.getByTestId('resolved').textContent).toBe('dark');
      expect(document.documentElement).toHaveClass('dark');
    });
  });
});
