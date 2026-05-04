'use client';
import { useEffect, useState } from 'react';
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

export function useShellViewport(): ShellViewport {
  // Initial state is always 'desktop' so server-rendered output matches the
  // client's first paint — actual band resolves in the post-mount effect.
  const [viewport, setViewport] = useState<ShellViewport>('desktop');

  useEffect(() => {
    const matchMedia = getMatchMedia();
    setViewport(detectViewport(matchMedia));
    if (!matchMedia) return;

    const cleanups = (Object.entries(BREAKPOINTS) as [ShellViewport, string][]).map(
      ([band, query]) => {
        const mql = matchMedia(query);
        const onChange = () => {
          /* v8 ignore next — false branch: listener fires but mql.matches is already false */
          if (mql.matches) setViewport(band);
        };
        mql.addEventListener('change', onChange);
        return () => mql.removeEventListener('change', onChange);
      }
    );

    return () => {
      for (const cleanup of cleanups) cleanup();
    };
  }, []);

  return viewport;
}
