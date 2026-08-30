'use client';
import { useSyncExternalStore } from 'react';
import type { ShellViewport } from './types.js';

const BREAKPOINTS = {
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px) and (max-width: 1279px)',
  wide: '(min-width: 1280px) and (max-width: 1535px)',
  ultrawide: '(min-width: 1536px)',
} as const;

type MatchMedia = (query: string) => MediaQueryList;

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
  /* v8 ignore next — matchMedia is always available in jsdom test env */
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

const getClientViewport = (): ShellViewport => detectViewport();
const getServerViewport = (): ShellViewport => 'desktop';

/**
 * The shell's viewport band, resolved SYNCHRONOUSLY on the first client
 * render.
 *
 * The previous implementation seeded `useState('desktop')` and detected the
 * real band in a post-mount effect. Because effects run after the first
 * commit, phones mounted the entire desktop shell tree (ShellHeader,
 * IconRail, ContextRail, RightPanel — plus whatever subscriptions consumers
 * hang off them) and immediately tore it down for the mobile tree: throwaway
 * work on the mobile critical path on every load.
 *
 * `useSyncExternalStore` reads `matchMedia` during the first client render,
 * so client-rendered apps commit the correct tree once. Server rendering
 * still returns 'desktop' via the server snapshot, and hydration stays
 * mismatch-safe (React uses the server snapshot while hydrating, then
 * re-reads — SSR consumers keep exactly the old behavior).
 */
export function useShellViewport(): ShellViewport {
  return useSyncExternalStore(subscribeToViewport, getClientViewport, getServerViewport);
}
