'use client';

import { Children, type HTMLAttributes, isValidElement, type ReactNode } from 'react';
import { cn } from '../lib/utils.js';

export interface AuthProviderListProps extends HTMLAttributes<HTMLUListElement> {
  children: ReactNode;
  label?: string;
}

export function AuthProviderList({
  children,
  className,
  label = 'Authentication providers',
  ...props
}: AuthProviderListProps) {
  return (
    <ul aria-label={label} className={cn('flex w-full flex-col gap-3', className)} {...props}>
      {Children.toArray(children).map((child, index) => (
        <li
          key={isValidElement(child) && child.key != null ? child.key : index}
          className="contents"
        >
          {child}
        </li>
      ))}
    </ul>
  );
}
