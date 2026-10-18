'use client';

import { Check } from 'lucide-react';
import type { ChangeEvent, ComponentProps } from 'react';
import { cn } from '../lib/utils.js';

export interface CheckboxProps extends Omit<ComponentProps<'input'>, 'type' | 'size'> {
  /**
   * Called with the new checked state. Fires alongside `onChange`, so a form
   * can use whichever it prefers.
   */
  onCheckedChange?: (checked: boolean) => void;
  /**
   * Marks the box invalid: sets `aria-invalid="true"` and the destructive
   * border. An explicit `aria-invalid` prop still wins.
   */
  invalid?: boolean;
  /** Class for the wrapping `<span>` (the input itself takes `className`). */
  rootClassName?: string;
}

/**
 * A native `<input type="checkbox">` drawn as a 16 px box with a check mark.
 * Native on purpose: it submits with a form, works with `<label htmlFor>`,
 * answers Space without JavaScript, and costs no dialog/portal machinery.
 * The input carries `data-slot="checkbox"` and a `data-invalid` hook; style
 * the checked state with `checked:` / `peer-checked:`.
 */
export function Checkbox({
  className,
  rootClassName,
  invalid = false,
  onCheckedChange,
  onChange,
  checked,
  defaultChecked,
  'aria-invalid': ariaInvalid,
  ...props
}: CheckboxProps) {
  const resolvedInvalid = ariaInvalid ?? (invalid || undefined);

  return (
    <span
      data-slot="checkbox-root"
      className={cn('relative inline-flex size-4 shrink-0', rootClassName)}
    >
      <input
        type="checkbox"
        data-slot="checkbox"
        data-invalid={resolvedInvalid === true || resolvedInvalid === 'true' ? '' : undefined}
        aria-invalid={resolvedInvalid}
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          onChange?.(event);
          onCheckedChange?.(event.currentTarget.checked);
        }}
        className={cn(
          // Same focus / invalid treatment as Input, so the two sit together.
          'peer size-4 shrink-0 cursor-pointer appearance-none rounded-[4px] border border-input bg-background transition-colors outline-none checked:border-primary checked:bg-primary focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/30 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
      <Check
        aria-hidden="true"
        data-slot="checkbox-indicator"
        className="pointer-events-none absolute inset-0 m-auto size-3.5 text-primary-foreground opacity-0 peer-checked:opacity-100"
      />
    </span>
  );
}
