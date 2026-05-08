'use client';

import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '../lib/utils.js';

export type StatusPillTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';
export type StatusPillSize = 'sm' | 'md';

export interface StatusPillProps extends ComponentPropsWithoutRef<'span'> {
  tone?: StatusPillTone;
  size?: StatusPillSize;
  /**
   * Show a leading dot. Defaults to true; pass `false` to hide.
   */
  dot?: boolean;
}

// Tone classes use solid backgrounds + their semantic foreground tokens.
// Tinted backgrounds (e.g. `bg-info/15 text-info`) failed WCAG AA contrast on
// the 11px size (~3:1 vs. the 4.5:1 minimum) — see vitest-axe a11y gate. The
// solid pairing is what existing meda status pills (e.g. voice-status-pill)
// use, and theme tokens already guarantee AA in both light and dark modes.
const TONE_CLASSES: Record<StatusPillTone, string> = {
  neutral: 'bg-muted text-muted-foreground',
  info: 'bg-info text-info-foreground',
  success: 'bg-success text-success-foreground',
  warning: 'bg-warning text-warning-foreground',
  danger: 'bg-destructive text-destructive-foreground',
};

const SIZE_CLASSES: Record<StatusPillSize, string> = {
  sm: 'gap-1 px-2 py-0.5 text-[11px]',
  md: 'gap-1.5 px-2.5 py-1 text-xs',
};

const DOT_SIZE: Record<StatusPillSize, string> = {
  sm: 'size-1.5',
  md: 'size-2',
};

export function StatusPill({
  tone = 'neutral',
  size = 'sm',
  dot = true,
  className,
  children,
  ...props
}: StatusPillProps) {
  return (
    <span
      data-slot="status-pill"
      data-tone={tone}
      data-size={size}
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        TONE_CLASSES[tone],
        SIZE_CLASSES[size],
        className
      )}
      {...props}
    >
      {dot ? (
        <span
          data-slot="status-pill-dot"
          aria-hidden="true"
          className={cn('rounded-full bg-current', DOT_SIZE[size])}
        />
      ) : null}
      {children}
    </span>
  );
}
