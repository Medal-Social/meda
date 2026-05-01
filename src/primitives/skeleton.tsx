'use client';

import type { ComponentProps } from 'react';
import { cn } from '../lib/utils.js';

export type SkeletonProps = ComponentProps<'div'>;

export function Skeleton({ className, 'aria-hidden': ariaHidden = true, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden={ariaHidden}
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}
