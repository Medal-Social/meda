'use client';

import type { ComponentProps } from 'react';
import { cn } from '../lib/utils.js';

export interface InputProps extends ComponentProps<'input'> {
  /**
   * Marks the field invalid: sets `aria-invalid="true"` and the destructive
   * border/ring. Pair it with `aria-describedby` pointing at the error text.
   * An explicit `aria-invalid` prop still wins.
   */
  invalid?: boolean;
}

export function Input({
  invalid = false,
  type = 'text',
  className,
  'aria-invalid': ariaInvalid,
  ...props
}: InputProps) {
  const resolvedInvalid = ariaInvalid ?? (invalid || undefined);

  return (
    <input
      type={type}
      data-slot="input"
      data-invalid={resolvedInvalid === true || resolvedInvalid === 'true' ? '' : undefined}
      aria-invalid={resolvedInvalid}
      className={cn(
        // text-base below `sm` keeps iOS Safari from zooming on focus.
        'flex h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-base text-foreground transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/30 file:border-0 file:bg-transparent file:text-sm file:font-medium sm:text-sm',
        className
      )}
      {...props}
    />
  );
}
