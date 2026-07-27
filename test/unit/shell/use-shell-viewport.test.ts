import { act, renderHook } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ShellViewportHintContext,
  useShellViewport,
} from '../../../src/shell/use-shell-viewport.js';

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

  it('reads the band synchronously on the first client render (no post-mount flash)', () => {
    // Regression guard for the SSR first-paint fix: with useSyncExternalStore
    // the very first render already reflects matchMedia — there is no
    // intermediate 'desktop' render waiting for a post-mount effect.
    mockMatchMedia(QUERIES.mobile);
    const bands: string[] = [];
    renderHook(() => {
      const band = useShellViewport();
      bands.push(band);
      return band;
    });
    expect(bands[0]).toBe('mobile');
  });

  it('updates viewport when MediaQueryList fires a change event with matches=true', () => {
    // Map query → { mql, listeners[] }
    const registry = new Map<string, { mql: { matches: boolean }; listeners: (() => void)[] }>();

    // Build a matchMedia stub with one shared state entry per query: the
    // store re-detects the band by calling matchMedia again when notified
    // (like a real browser, where every MediaQueryList reflects live window
    // state), so repeated calls for the same query must see the mutation.
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => {
        let entry = registry.get(query);
        if (!entry) {
          entry = { mql: { matches: false }, listeners: [] as (() => void)[] };
          registry.set(query, entry);
        }
        const state = entry;

        return {
          get matches() {
            return state.mql.matches;
          },
          media: query,
          onchange: null,
          addEventListener: vi.fn((_event: string, listener: () => void) => {
            state.listeners.push(listener);
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

describe('ShellViewportHintContext', () => {
  function hintWrapper(value: 'mobile' | 'desktop' | null) {
    return ({ children }: { children: ReactNode }) =>
      createElement(ShellViewportHintContext.Provider, { value }, children);
  }

  function Probe() {
    return createElement('span', null, useShellViewport());
  }

  it('server render emits the hinted band', () => {
    // renderToString exercises the getServerSnapshot path — the same one the
    // real server renderer uses — so a 'mobile' hint must produce mobile
    // markup from the first byte.
    const html = renderToString(
      createElement(ShellViewportHintContext.Provider, { value: 'mobile' }, createElement(Probe))
    );
    expect(html).toContain('mobile');
  });

  it("server render stays 'desktop' without a hint", () => {
    const html = renderToString(createElement(Probe));
    expect(html).toContain('desktop');
  });

  it('client renders ignore the hint once matchMedia is readable', () => {
    // The hint is a server/hydration snapshot only — a live client whose
    // matchMedia reports desktop must render desktop even under a 'mobile'
    // hint provider.
    mockMatchMedia(QUERIES.desktop);
    const { result } = renderHook(() => useShellViewport(), { wrapper: hintWrapper('mobile') });
    act(() => {});
    expect(result.current).toBe('desktop');
  });
});
