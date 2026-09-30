'use client';

import { LoaderCircle } from 'lucide-react';
import type { ButtonHTMLAttributes, ComponentProps, MouseEvent, ReactNode } from 'react';
import { type RenderElement, renderElement } from '../lib/render-element.js';
import { cn } from '../lib/utils.js';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /**
   * Shows a spinner, sets `aria-busy`, and swallows clicks while keeping the
   * button focusable (so focus is not lost mid-submit) and its width stable.
   */
  loading?: boolean;
  /** Screen-reader text announced while `loading`. Defaults to "Loading". */
  loadingLabel?: string;
  /**
   * Render as another element (e.g. a router `<Link>` or `<a>`), merging
   * meda's props and classes onto it — same pattern as `AuthProviderButton`.
   */
  render?: RenderElement<ButtonHTMLAttributes<HTMLElement>>;
}

// Semantic tokens only, so a consumer's own `--primary` / `--secondary` /
// `--accent` re-theme the button without touching meda.
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  ghost: 'text-foreground hover:bg-accent hover:text-accent-foreground',
  outline:
    'border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 px-3 text-xs [&_svg]:size-3.5',
  md: 'h-10 gap-2 px-4 text-sm [&_svg]:size-4',
  lg: 'h-11 gap-2 px-5 text-base [&_svg]:size-4',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingLabel = 'Loading',
  render,
  type = 'button',
  disabled,
  className,
  children,
  onClick,
  ...props
}: ButtonProps) {
  // A rendered link can't be natively disabled, so swallow its clicks too.
  const inert = loading || (render !== undefined && Boolean(disabled));
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (inert) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  const content: ReactNode = (
    <>
      {loading ? (
        <>
          <LoaderCircle
            data-slot="button-spinner"
            aria-hidden="true"
            className="animate-spin motion-reduce:animate-none"
          />
          <span className="sr-only">{loadingLabel}</span>
        </>
      ) : null}
      {children}
    </>
  );

  const buttonProps = {
    ...props,
    'data-slot': 'button',
    'data-variant': variant,
    'data-size': size,
    'data-loading': loading || undefined,
    'aria-busy': loading || undefined,
    'aria-disabled': loading || undefined,
    className: cn(
      'relative inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-disabled:pointer-events-none data-disabled:opacity-50 data-loading:cursor-progress [&_svg]:pointer-events-none [&_svg]:shrink-0',
      VARIANT_CLASSES[variant],
      SIZE_CLASSES[size],
      className
    ),
    onClick: handleClick,
    children: content,
  };

  if (render) {
    // Non-button hosts (links) have no `disabled`; expose it via ARIA instead.
    return renderElement(render, {
      ...buttonProps,
      'aria-disabled': inert || undefined,
      'data-disabled': disabled || undefined,
    } as ButtonHTMLAttributes<HTMLElement>);
  }

  return <button type={type} disabled={disabled} {...buttonProps} />;
}
