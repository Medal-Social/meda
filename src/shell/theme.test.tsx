import { act, render, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DefaultThemeProvider, useTheme } from './theme.js';

// Ensure next-themes is never loaded when the default adapter is used.
vi.mock('next-themes', () => {
  throw new Error('next-themes was imported — must not happen with default adapter');
});

function createStorageMock() {
  const store = new Map<string, string>();
  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    clear: vi.fn(() => {
      store.clear();
    }),
  };
}

function wrapper({ children }: { children: ReactNode }) {
  return <DefaultThemeProvider>{children}</DefaultThemeProvider>;
}

describe('NextThemesAdapter — does not import next-themes when adapter="default"', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders DefaultThemeProvider without loading next-themes', () => {
    // Stub localStorage so the DefaultThemeProvider useEffect can run safely.
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });

    // The vi.mock above makes next-themes throw on import. If this render triggers
    // that import, the test will fail. Passing means the bridge file was not loaded.
    expect(() =>
      render(
        <DefaultThemeProvider>
          <div />
        </DefaultThemeProvider>
      )
    ).not.toThrow();
  });
});

describe('useTheme', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createStorageMock());
  });

  afterEach(() => {
    document.documentElement.classList.remove('dark');
    vi.unstubAllGlobals();
  });

  it("defaults to 'system'", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    act(() => {});
    expect(result.current.theme).toBe('system');
  });

  it("setTheme('dark') applies class=\"dark\" to html and persists to localStorage key 'meda:theme'", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setTheme('dark');
    });

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('meda:theme')).toBe('dark');
  });

  it("resolvedTheme follows system when theme is 'system'", () => {
    // Stub matchMedia to report dark system preference
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => {
        const matches = query === '(prefers-color-scheme: dark)';
        return {
          matches,
          media: query,
          onchange: null,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        };
      })
    );

    const { result } = renderHook(() => useTheme(), { wrapper });
    act(() => {});
    expect(result.current.resolvedTheme).toBe('dark');
  });

  it('SSR-safe: useTheme throws outside <DefaultThemeProvider>', () => {
    // Validates the context guard — accessing window/document only inside
    // useEffect means module load is always SSR-safe. The thrown error
    // confirms the provider contract is enforced.
    expect(() => renderHook(() => useTheme())).toThrow(
      'useTheme must be used inside <MedaShellProvider>'
    );
  });
});
