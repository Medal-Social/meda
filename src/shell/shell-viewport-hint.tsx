'use client';
import type { ReactNode } from 'react';
import type { ShellViewport } from './types.js';
import { ShellViewportHintContext } from './use-shell-viewport.js';

export interface ShellViewportHintProviderProps {
  /**
   * Coarse device class detected from the request, or `null` to keep the
   * desktop-first default.
   */
  value: ShellViewport | null;
  children: ReactNode;
}

/**
 * Client wrapper that supplies the SSR viewport hint.
 *
 * React Context providers cannot be rendered from a React Server Component,
 * so an App Router server component — the place where request headers are
 * actually available — must render this client component instead of touching
 * `ShellViewportHintContext.Provider` itself:
 *
 *   // app/layout.tsx — server component
 *   import { headers } from 'next/headers';
 *   import { ShellViewportHintProvider } from '@medalsocial/meda/shell';
 *
 *   export default async function Layout({ children }) {
 *     const isPhone = (await headers()).get('sec-ch-ua-mobile') === '?1';
 *     return (
 *       <ShellViewportHintProvider value={isPhone ? 'mobile' : null}>
 *         {children}
 *       </ShellViewportHintProvider>
 *     );
 *   }
 *
 * See {@link ShellViewportHintContext} for what the hint does.
 */
export function ShellViewportHintProvider({ value, children }: ShellViewportHintProviderProps) {
  return (
    <ShellViewportHintContext.Provider value={value}>{children}</ShellViewportHintContext.Provider>
  );
}
