'use client';

/**
 * List Row Component
 *
 * Base row wrapper for Linear-style table rows.
 * Provides consistent styling for hover, selection, and keyboard focus states.
 */

import type { ReactNode } from 'react';
import { Checkbox } from '../components/ui/checkbox.js';
import { cn } from '../lib/utils.js';

export interface ListRowProps {
  /** Whether this row is selected */
  selected?: boolean;
  /** Whether any item in the list is selected (keeps checkbox always visible) */
  selectionActive?: boolean;
  /** Callback when selection changes (shiftKey for range selection) */
  onSelect?: (selected: boolean, shiftKey?: boolean) => void;
  /** Click handler for row navigation */
  onClick?: () => void;
  /** Mouse enter handler for prefetching */
  onMouseEnter?: () => void;
  /** Mouse leave handler */
  onMouseLeave?: () => void;
  /** Focus handler for keyboard intent prefetching */
  onFocus?: () => void;
  /** Blur handler */
  onBlur?: () => void;
  /** Whether this row has keyboard focus */
  focused?: boolean;
  /** Children to render inside the row */
  children: ReactNode;
  /** Additional class names */
  className?: string;
}

/**
 * A Linear-style list row with checkbox, hover states, and click handling.
 * Compact ~40-48px height for dense, scannable lists.
 */
export function ListRow({
  selected,
  selectionActive,
  onSelect,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  focused,
  children,
  className,
}: ListRowProps) {
  const isInteractive = !!onClick;
  const interactiveProps = isInteractive
    ? {
        role: 'button' as const,
        tabIndex: 0,
        onClick,
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.();
          }
        },
      }
    : {};
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: mouse/focus handlers are passive prefetch hooks; interactive role added only when onClick is set
    <div
      {...interactiveProps}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      className={cn(
        'group relative flex items-center gap-3 border-border border-b px-3 py-2.5',
        'transition-all duration-150',
        isInteractive && 'cursor-pointer hover:bg-accent/50',
        isInteractive &&
          "before:absolute before:inset-y-0 before:left-0 before:w-[2px] before:scale-y-0 before:bg-primary before:transition-transform before:duration-150 before:content-['']",
        isInteractive && 'hover:before:scale-y-100',
        isInteractive && 'focus-within:bg-accent/30 focus-within:before:scale-y-100',
        selected && isInteractive && 'before:!scale-y-100 bg-accent',
        selected && !isInteractive && 'bg-accent',
        focused &&
          isInteractive &&
          'before:!scale-y-100 bg-accent/30 ring-1 ring-primary/50 ring-inset',
        focused && !isInteractive && 'bg-accent/30 ring-1 ring-primary/50 ring-inset',
        className
      )}
    >
      {onSelect && (
        // biome-ignore lint/a11y/noStaticElementInteractions: wrapper only stops event propagation to parent row
        <div
          className="w-6 flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={selected}
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              onSelect(!selected, e.shiftKey);
            }}
            className={cn(
              'transition-opacity',
              selectionActive || selected
                ? 'opacity-100'
                : 'opacity-0 group-hover:opacity-100 data-[state=checked]:opacity-100'
            )}
          />
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * Cell wrapper for consistent column sizing
 */
export interface ListCellProps {
  /** Width class (e.g., 'w-8', 'w-24', 'flex-1') */
  width?: string;
  /** Whether to shrink if needed */
  shrink?: boolean;
  /** Alignment */
  align?: 'left' | 'center' | 'right';
  /** Children */
  children?: ReactNode;
  /** Additional class names */
  className?: string;
}

export function ListCell({
  width = 'flex-1',
  shrink = true,
  align = 'left',
  children,
  className,
}: ListCellProps) {
  return (
    <div
      className={cn(
        width,
        shrink === false && 'flex-shrink-0',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        'min-w-0', // Allow truncation
        className
      )}
    >
      {children}
    </div>
  );
}
