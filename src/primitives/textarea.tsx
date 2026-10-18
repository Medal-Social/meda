'use client';

import type { ComponentProps } from 'react';
import { cn } from '../lib/utils.js';

export interface TextareaProps extends ComponentProps<'textarea'> {
  /**
   * Marks the field invalid: sets `aria-invalid="true"` and the destructive
   * border/ring. Pair it with `aria-describedby` pointing at the error text.
   * An explicit `aria-invalid` prop still wins.
   */
  invalid?: boolean;
}

/**
 * Multi-line text input matching `Input`. Grows with its content where the
 * browser supports `field-sizing: content`, starting at `min-h-16`.
 */
export function Textarea({
  invalid = false,
  className,
  'aria-invalid': ariaInvalid,
  ...props
}: TextareaProps) {
  const resolvedInvalid = ariaInvalid ?? (invalid || undefined);

  return (
    <textarea
      data-slot="textarea"
      data-invalid={resolvedInvalid === true || resolvedInvalid === 'true' ? '' : undefined}
      aria-invalid={resolvedInvalid}
      className={cn(
        // text-base below `sm` keeps iOS Safari from zooming on focus.
        'flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-background px-3 py-2 text-base text-foreground transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/30 sm:text-sm',
        className
      )}
      {...props}
    />
  );
}
