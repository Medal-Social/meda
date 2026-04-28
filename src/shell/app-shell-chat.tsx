'use client';
import type { ReactNode } from 'react';
import { cn } from '../lib/utils.js';
import { useShellViewport } from './use-shell-viewport.js';

export interface AppShellChatProps {
  globalActions?: ReactNode;
  children: ReactNode;
}

export function AppShellChat({ globalActions, children }: AppShellChatProps) {
  const viewport = useShellViewport();
  const isMobile = viewport === 'mobile';

  return (
    <section
      data-testid="app-shell-chat"
      className="flex h-screen flex-col bg-background text-foreground"
    >
      <header className="flex h-12 items-center justify-between border-b border-border px-4">
        <span className="text-sm font-medium text-foreground">Chat</span>
        {globalActions ? <div className="flex items-center gap-2">{globalActions}</div> : null}
      </header>
      <div className={cn('flex-1 overflow-y-auto', isMobile ? 'px-2 py-3' : 'px-6 py-4')}>
        {children}
      </div>
    </section>
  );
}
