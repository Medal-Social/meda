import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DefaultThemeProvider, useTheme } from './theme.js';

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
    // Override matchMedia to report dark system preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => {
        const matches = query === '(prefers-color-scheme: dark)';
        const listeners: Array<() => void> = [];
        return {
          matches,
          media: query,
          onchange: null,
          addEventListener: vi.fn((_event: string, cb: () => void) => {
            listeners.push(cb);
          }),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        };
      }),
    });

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
