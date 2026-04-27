'use client';

import type { ReactNode } from 'react';
import { cn } from '../lib/utils.js';
import { useMedaShell } from './shell-provider.js';

export function AppShell({ children, className }: { children: ReactNode; className?: string }) {
  const { workspace, activeAppId } = useMedaShell();
  return (
    <div
      data-meda-app={activeAppId}
      data-meda-workspace={workspace.id}
      className={cn('h-screen overflow-hidden bg-background text-foreground', className)}
    >
      {children}
    </div>
  );
}

export function AppShellBody({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'relative flex h-[calc(100vh-var(--shell-header-height))] overflow-hidden',
        className
      )}
    >
      {children}
    </div>
  );
}
