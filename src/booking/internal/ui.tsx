'use client';

import type { ComponentProps } from 'react';
import { cn } from '../../lib/utils.js';

/**
 * The booking screens' control look, in one place.
 *
 * Booking has its own proportions — 48 px fields, 1.5 px borders, near-square
 * corners, a tall primary button — tuned for a parent booking on a phone. The
 * screens build on meda's primitives (`Input`, `Textarea`, `Checkbox`,
 * `Field`, `Sheet`) and pass these classes as overrides; tailwind-merge makes
 * them win over the primitive defaults they conflict with. Colours are bridge
 * variables only, so a site's own `--primary` / `--border` / … re-theme them.
 */

export type BookingButtonVariant =
  | 'default'
  | 'outline'
  | 'secondary'
  | 'ghost'
  | 'destructive'
  | 'link';
export type BookingButtonSize = 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm';

const BUTTON_BASE =
  'group/button inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-[3px] border border-transparent bg-clip-padding text-sm font-semibold transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4';

const BUTTON_VARIANTS: Record<BookingButtonVariant, string> = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  outline:
    'border-[1.5px] border-primary/35 bg-transparent text-primary hover:border-primary hover:bg-primary/5 aria-expanded:bg-primary/5 aria-expanded:text-primary',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
  ghost:
    'hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50',
  destructive:
    'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30',
  link: 'text-primary underline-offset-4 hover:underline',
};

const BUTTON_SIZES: Record<BookingButtonSize, string> = {
  default: 'h-10 gap-1.5 px-5 text-[15px]',
  sm: 'h-8 gap-1 rounded-[min(var(--radius-md),10px)] px-2.5',
  lg: 'h-auto gap-1.5 px-7 py-[15px] text-[15px]',
  icon: 'size-9',
  'icon-sm': 'size-8 rounded-[min(var(--radius-md),10px)]',
};

/** Classes for a booking button — also for a link that should look like one. */
export function bookingButtonClass({
  variant = 'default',
  size = 'default',
  className,
}: {
  variant?: BookingButtonVariant;
  size?: BookingButtonSize;
  className?: string;
} = {}): string {
  return cn(BUTTON_BASE, BUTTON_VARIANTS[variant], BUTTON_SIZES[size], className);
}

export interface BookingButtonProps extends ComponentProps<'button'> {
  variant?: BookingButtonVariant;
  size?: BookingButtonSize;
}

/** The booking screens' button. A native `<button type="button">` unless told otherwise. */
export function BookingButton({
  variant,
  size,
  className,
  type = 'button',
  ...props
}: BookingButtonProps) {
  return (
    <button
      type={type}
      data-slot="button"
      className={bookingButtonClass({ variant, size, className })}
      {...props}
    />
  );
}

/** Override for meda `Input` in booking forms. */
export const BOOKING_INPUT_CLASS =
  'h-12 rounded-[4px] border-[1.5px] border-input bg-background px-4 py-3 text-base transition-[color,border-color] focus-visible:border-primary focus-visible:ring-0 aria-invalid:border-destructive sm:text-base md:text-base dark:aria-invalid:border-destructive/50';

/** Override for meda `Textarea` in booking forms. */
export const BOOKING_TEXTAREA_CLASS =
  'min-h-16 rounded-[4px] border-[1.5px] border-input bg-background px-4 py-3 text-base transition-[color,border-color] focus-visible:border-primary focus-visible:ring-0 aria-invalid:border-destructive sm:text-base md:text-base dark:aria-invalid:border-destructive/50';

/** Override for meda `Checkbox` in booking forms. */
export const BOOKING_CHECKBOX_CLASS =
  'shadow-xs transition-shadow focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 dark:bg-input/30';

/** A native `<select>` sized like a booking input. */
export const BOOKING_SELECT_CLASS =
  'h-12 w-full rounded-[4px] border border-input bg-transparent px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50';
