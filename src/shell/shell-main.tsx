'use client';
import type { ReactNode } from 'react';
import { cn } from '../lib/utils.js';
import type { ShellMainLayout } from './types.js';

export interface ShellMainProps {
  layout?: ShellMainLayout;
  className?: string;
  children: ReactNode;
}

const layoutClass: Record<ShellMainLayout, string> = {
  workspace: 'mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8',
  centered: 'mx-auto w-full max-w-2xl px-4 py-6 sm:px-6',
  fullbleed: 'w-full',
};

export function ShellMain({ layout = 'workspace', className, children }: ShellMainProps) {
  return (
    <main
      data-meda-shell-main-layout={layout}
      className={cn(
        'flex-1 min-w-0 overflow-y-auto bg-shell-main',
        '[content-visibility:auto]',
        layoutClass[layout],
        className
      )}
    >
      {children}
    </main>
  );
}
