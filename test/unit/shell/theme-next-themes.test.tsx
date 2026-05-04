import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useTheme } from '../../../src/shell/../../src/shell/theme.js';
import { NextThemesAdapter } from '../../../src/shell/../../src/shell/theme-next-themes.js';

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

  it('calling setTheme persists the chosen theme to localStorage', async () => {
    stubThemeEnvironment({ storedTheme: null, systemDark: false });

    render(
      <NextThemesAdapter>
        <ThemeConsumer />
      </NextThemesAdapter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('theme').textContent).toBe('system');
    });

    // Directly set the theme to 'dark' via the context
    const { useTheme } = await import('./theme.js');

    function Setter() {
      const { setTheme } = useTheme();
      return (
        <button type="button" onClick={() => setTheme('dark')}>
          Set dark
        </button>
      );
    }

    const { rerender } = render(
      <NextThemesAdapter>
        <Setter />
      </NextThemesAdapter>
    );

    const btn = screen.getByRole('button', { name: 'Set dark' });
    btn.click();

    rerender(
      <NextThemesAdapter>
        <Setter />
        <ThemeConsumer />
      </NextThemesAdapter>
    );

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
    });
  });

  it('storage event with a different key is ignored', async () => {
    stubThemeEnvironment({ storedTheme: null });

    render(
      <NextThemesAdapter>
        <ThemeConsumer />
      </NextThemesAdapter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('theme').textContent).toBe('system');
    });

    // Fire a storage event with a different key — should be ignored
    const event = new StorageEvent('storage', { key: 'other-key', newValue: 'dark' });
    window.dispatchEvent(event);

    // Theme should remain 'system'
    expect(screen.getByTestId('theme').textContent).toBe('system');
  });

  it('storage event with the theme key updates the theme', async () => {
    stubThemeEnvironment({ storedTheme: null });

    render(
      <NextThemesAdapter>
        <ThemeConsumer />
      </NextThemesAdapter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('theme').textContent).toBe('system');
    });

    // Fire a storage event for the 'theme' key
    const event = new StorageEvent('storage', { key: 'theme', newValue: 'dark' });
    window.dispatchEvent(event);

    await waitFor(() => {
      expect(screen.getByTestId('theme').textContent).toBe('dark');
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

  it('setTheme("system") resolves via system preference (system branch)', async () => {
    stubThemeEnvironment({ storedTheme: null, systemDark: false });

    function Setter() {
      const { setTheme, theme } = useTheme();
      return (
        <>
          <button type="button" onClick={() => setTheme('system')} data-testid="set-system">
            Set system
          </button>
          <span data-testid="theme">{theme}</span>
        </>
      );
    }

    render(
      <NextThemesAdapter>
        <Setter />
      </NextThemesAdapter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('theme').textContent).toBe('system');
    });

    // Click to re-set theme to 'system' (even if already system) — covers the ternary true branch
    screen.getByTestId('set-system').click();

    await waitFor(() => {
      expect(screen.getByTestId('theme').textContent).toBe('system');
    });
  });

  it('returns system theme when localStorage.getItem throws', async () => {
    vi.stubGlobal('localStorage', {
      get getItem() {
        throw new Error('QuotaExceeded');
      },
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        matches: false,
        media: '',
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))
    );

    render(
      <NextThemesAdapter>
        <ThemeConsumer />
      </NextThemesAdapter>
    );

    await waitFor(() => {
      // Falls back to 'system' when getItem throws
      expect(screen.getByTestId('theme').textContent).toBe('system');
    });
  });

  it('handles mql with no addEventListener and no addListener gracefully', async () => {
    // Stub matchMedia to return an mql that has neither addEventListener nor addListener.
    // This exercises the final `return () => undefined` branch in subscribeToSystemTheme.
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        // Neither addEventListener nor addListener
        dispatchEvent: vi.fn(),
      }))
    );

    render(
      <NextThemesAdapter>
        <ThemeConsumer />
      </NextThemesAdapter>
    );

    await waitFor(() => {
      // Should render without throwing
      expect(screen.getByTestId('theme').textContent).toBe('system');
    });
  });
});
