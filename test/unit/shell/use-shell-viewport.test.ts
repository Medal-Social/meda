import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useShellViewport } from '../../../src/shell/use-shell-viewport.js';

const QUERIES = {
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px) and (max-width: 1279px)',
  wide: '(min-width: 1280px) and (max-width: 1535px)',
  ultrawide: '(min-width: 1536px)',
} as const;

function defaultMatchMedia() {
  return vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

function mockMatchMedia(matchingQuery: string) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === matchingQuery,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

afterEach(() => {
  // Restore the all-false default so test isolation is maintained between
  // band-specific overrides (Object.defineProperty isn't undone by unstubAllGlobals).
  Object.defineProperty(window, 'matchMedia', { writable: true, value: defaultMatchMedia() });
  vi.unstubAllGlobals();
});

describe('useShellViewport', () => {
  it("returns 'mobile' for <768", () => {
    mockMatchMedia(QUERIES.mobile);
    const { result } = renderHook(() => useShellViewport());
    act(() => {});
    expect(result.current).toBe('mobile');
  });

  it("returns 'tablet' for 768–1023", () => {
    mockMatchMedia(QUERIES.tablet);
    const { result } = renderHook(() => useShellViewport());
    act(() => {});
    expect(result.current).toBe('tablet');
  });

  it("returns 'desktop' for 1024–1279", () => {
    mockMatchMedia(QUERIES.desktop);
    const { result } = renderHook(() => useShellViewport());
    act(() => {});
    expect(result.current).toBe('desktop');
  });

  it("returns 'wide' for 1280–1535", () => {
    mockMatchMedia(QUERIES.wide);
    const { result } = renderHook(() => useShellViewport());
    act(() => {});
    expect(result.current).toBe('wide');
  });

  it("returns 'ultrawide' for >=1536", () => {
    mockMatchMedia(QUERIES.ultrawide);
    const { result } = renderHook(() => useShellViewport());
    act(() => {});
    expect(result.current).toBe('ultrawide');
  });

  it("returns 'desktop' when matchMedia is unavailable", () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: undefined,
    });

    const { result } = renderHook(() => useShellViewport());
    act(() => {});

    expect(result.current).toBe('desktop');
  });

  it("SSR-safe: returns 'desktop' before hydration", () => {
    // The vitest.setup.ts default matchMedia mock returns matches: false for
    // every query, so detectViewport() falls through to the 'desktop' default.
    // This confirms the hook's SSR-safe initial state survives the effect
    // when no band matches — exactly what would happen on first server render.
    const { result } = renderHook(() => useShellViewport());
    act(() => {});
    expect(result.current).toBe('desktop');
  });

  it('updates viewport when MediaQueryList fires a change event with matches=true', () => {
    // Map query → { mql, listeners[] }
    const registry = new Map<string, { mql: { matches: boolean }; listeners: (() => void)[] }>();

    // Build a matchMedia stub that stores mql references so we can mutate
    // `matches` before firing the change listener (the hook reads mql.matches
    // from the closure, not from the event argument).
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => {
        const entry = { mql: { matches: false }, listeners: [] as (() => void)[] };
        registry.set(query, entry);

        return {
          get matches() {
            return entry.mql.matches;
          },
          media: query,
          onchange: null,
          addEventListener: vi.fn((_event: string, listener: () => void) => {
            entry.listeners.push(listener);
          }),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        };
      }),
    });

    const { result } = renderHook(() => useShellViewport());
    act(() => {});

    // Mutate matches=true on the mobile MQL, then fire its listeners
    const mobileEntry = registry.get(QUERIES.mobile);
    if (!mobileEntry) throw new Error('mobile MQL not registered');

    act(() => {
      mobileEntry.mql.matches = true;
      for (const listener of mobileEntry.listeners) {
        listener();
      }
    });

    expect(result.current).toBe('mobile');
  });
});
