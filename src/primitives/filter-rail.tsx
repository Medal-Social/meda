'use client';

import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '../lib/utils.js';

export interface FilterRailProps extends Omit<ComponentPropsWithoutRef<'aside'>, 'title'> {
  title?: ReactNode;
  description?: ReactNode;
  search?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
}

export interface FilterRailGroupProps extends Omit<ComponentPropsWithoutRef<'fieldset'>, 'title'> {
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}

function FilterRailGroup({
  title,
  description,
  children,
  className,
  ...props
}: FilterRailGroupProps) {
  return (
    <fieldset
      data-slot="filter-rail-group"
      className={cn('space-y-2 border-0 p-0', className)}
      {...props}
    >
      {title ? (
        <legend
          data-slot="filter-rail-group-title"
          className="text-xs font-semibold text-foreground"
        >
          {title}
        </legend>
      ) : null}
      {description ? (
        <p data-slot="filter-rail-group-description" className="text-xs text-muted-foreground">
          {description}
        </p>
      ) : null}
      <div data-slot="filter-rail-group-content" className="space-y-1.5">
        {children}
      </div>
    </fieldset>
  );
}

function FilterRailRoot({
  title,
  description,
  search,
  actions,
  footer,
  children,
  className,
  'aria-label': ariaLabel,
  ...props
}: FilterRailProps) {
  const label = ariaLabel ?? (typeof title === 'string' ? title : undefined);

  return (
    <aside
      data-slot="filter-rail"
      aria-label={label}
      className={cn(
        'flex min-h-0 w-full flex-col border-border bg-card text-card-foreground',
        className
      )}
      {...props}
    >
      {title || description || actions ? (
        <div
          data-slot="filter-rail-header"
          className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-4 py-3"
        >
          <div className="min-w-0">
            {title ? (
              <h2 data-slot="filter-rail-title" className="text-sm font-semibold text-foreground">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p
                data-slot="filter-rail-description"
                className="mt-0.5 text-xs text-muted-foreground"
              >
                {description}
              </p>
            ) : null}
          </div>
          {actions ? (
            <div data-slot="filter-rail-actions" className="shrink-0">
              {actions}
            </div>
          ) : null}
        </div>
      ) : null}
      {search ? (
        <div data-slot="filter-rail-search" className="shrink-0 border-b border-border p-3">
          {search}
        </div>
      ) : null}
      <div data-slot="filter-rail-content" className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
        {children}
      </div>
      {footer ? (
        <div data-slot="filter-rail-footer" className="shrink-0 border-t border-border p-3">
          {footer}
        </div>
      ) : null}
    </aside>
  );
}

export const FilterRail = Object.assign(FilterRailRoot, {
  Group: FilterRailGroup,
});
