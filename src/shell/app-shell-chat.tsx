'use client';
import type { ReactNode } from 'react';

export function AppShellChat({ children }: { globalActions?: ReactNode; children: ReactNode }) {
  return <div data-testid="app-shell-chat">{children}</div>;
}
