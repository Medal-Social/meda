'use client';

import { ChevronDown } from 'lucide-react';
import type { MarketingNavItemDescriptor } from './types.js';
import { cx } from './utils.js';

export function MarketingNavItem({
  id,
  label,
  className,
  ...rest
}: MarketingNavItemDescriptor & { className?: string }) {
  if (rest.hasMenu) {
    return (
      <button
        type="button"
        data-nav-id={id}
        aria-expanded={false}
        aria-haspopup="menu"
        className={cx(
          'inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-foreground/80 hover:text-foreground',
          className
        )}
      >
        {label}
        <ChevronDown data-chevron className="h-3.5 w-3.5" aria-hidden />
      </button>
    );
  }
  return (
    <a
      href={rest.href}
      data-nav-id={id}
      className={cx(
        'inline-flex items-center rounded-full px-3 py-1.5 text-sm text-foreground/80 hover:text-foreground',
        className
      )}
    >
      {label}
    </a>
  );
}
