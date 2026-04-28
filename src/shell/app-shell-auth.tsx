'use client';
import type { ReactNode } from 'react';
import type { AppShellAuthConfig } from './types.js';

export function AppShellAuth({ title, children }: AppShellAuthConfig & { children: ReactNode }) {
  return (
    <section data-testid="app-shell-auth">
      <h1>{title}</h1>
      {children}
    </section>
  );
}
