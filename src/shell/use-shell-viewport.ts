'use client';
import { createContext, useContext, useSyncExternalStore } from 'react';
import type { ShellViewport } from './types.js';

const BREAKPOINTS = {
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px) and (max-width: 1279px)',
  wide: '(min-width: 1280px) and (max-width: 1535px)',
  ultrawide: '(min-width: 1536px)',
} as const;

type MatchMedia = (query: string) => MediaQueryList;

/**
 * Optional SSR device-class hint.
 *
 * The server cannot measure the window, so by default server output (and the
 * hydration snapshot) assumes 'desktop' — on phones that means the desktop
 * shell is the first HTML on screen. Apps that can classify the request
 * (Sec-CH-UA-Mobile, User-Agent markers) may provide a coarse band here to
 * emit the right chrome from the first byte:
 *
 *   <ShellViewportHintContext.Provider value={isPhoneRequest ? 'mobile' : null}>
 *     <AppShell ... />
 *   </ShellViewportHintContext.Provider>
 *
 * The hint is used ONLY as the server/hydration snapshot; matchMedia owns the
 * value from hydration onward. `null` keeps the desktop-first default.
 */
export const ShellViewportHintContext = createContext<ShellViewport | null>(null);

function getMatchMedia(): MatchMedia | null {
  /* v8 ignore next — SSR guard: window is always defined in jsdom test env */
  if (typeof window === 'undefined') return null;
  if (typeof window.matchMedia !== 'function') return null;
  return window.matchMedia.bind(window);
}

function detectViewport(matchMedia: MatchMedia | null = getMatchMedia()): ShellViewport {
  if (!matchMedia) return 'desktop';
  for (const [band, query] of Object.entries(BREAKPOINTS) as [ShellViewport, string][]) {
    if (matchMedia(query).matches) return band;
  }
  return 'desktop';
}

function subscribeToViewport(onChange: () => void): () => void {
  const matchMedia = getMatchMedia();
  if (!matchMedia) return () => {};

  const cleanups = Object.values(BREAKPOINTS).map((query) => {
    const mql = matchMedia(query);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  });

  return () => {
    for (const cleanup of cleanups) cleanup();
  };
}

function getViewportSnapshot(): ShellViewport {
  return detectViewport();
}

export function useShellViewport(): ShellViewport {
  // Read matchMedia synchronously through useSyncExternalStore. The previous
  // useState('desktop') + post-mount effect shape guaranteed at least one
  // painted desktop frame on phones after hydration; with a sync external
  // store React reconciles the server snapshot against the live matchMedia
  // value before the browser paints, so a wrong server guess never reaches
  // the screen. The server snapshot comes from the optional app-provided
  // hint and falls back to the historical 'desktop' default.
  const hint = useContext(ShellViewportHintContext);
  return useSyncExternalStore(subscribeToViewport, getViewportSnapshot, () => hint ?? 'desktop');
}
