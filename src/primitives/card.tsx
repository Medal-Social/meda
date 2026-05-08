'use client';

import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '../lib/utils.js';

export type CardProps = ComponentPropsWithoutRef<'div'>;

export type CardHeaderProps = ComponentPropsWithoutRef<'div'>;
export type CardBodyProps = ComponentPropsWithoutRef<'div'>;
export type CardFooterProps = ComponentPropsWithoutRef<'div'>;

function CardRoot({ children, className, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(
        'flex flex-col rounded-xl border border-border bg-card text-card-foreground',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function CardHeader({ children, className, ...props }: CardHeaderProps) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        'flex flex-col gap-1 border-b border-border px-4 py-3 last:border-b-0',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function CardBody({ children, className, ...props }: CardBodyProps) {
  return (
    <div data-slot="card-body" className={cn('px-4 py-3', className)} {...props}>
      {children}
    </div>
  );
}

function CardFooter({ children, className, ...props }: CardFooterProps) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        'flex items-center justify-end gap-2 border-t border-border px-4 py-3 first:border-t-0',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
});
