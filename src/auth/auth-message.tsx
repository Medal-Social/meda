'use client';

import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/utils.js';

export interface AuthMessageProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export function AuthError({ children, className, ...props }: AuthMessageProps) {
  if (!children) {
    return null;
  }

  return (
    <div
      role="alert"
      className={cn(
        'rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function AuthNotice({ children, className, ...props }: AuthMessageProps) {
  if (!children) {
    return null;
  }

  return (
    <div
      className={cn(
        'rounded-md border border-border bg-muted/60 px-3 py-2 text-sm text-muted-foreground',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface AuthOneTapSlotProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export function AuthOneTapSlot({ children, className, ...props }: AuthOneTapSlotProps) {
  return (
    <div data-meda-auth-one-tap-slot="" className={cn('contents', className)} {...props}>
      {children}
    </div>
  );
}
