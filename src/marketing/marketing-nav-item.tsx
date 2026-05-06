'use client';

import { ChevronDown } from 'lucide-react';
import type { MarketingNavItemDescriptor } from './types.js';
import { cx } from './utils.js';

export function MarketingNavItem({
  id,
  label,
  href,
  hasMenu,
  className,
}: MarketingNavItemDescriptor & { className?: string }) {
  if (!hasMenu && href) {
    return (
      <a
        href={href}
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
  return (
    <button
      type="button"
      data-nav-id={id}
      aria-expanded={false}
      className={cx(
        'inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-foreground/80 hover:text-foreground',
        className
      )}
    >
      {label}
      {hasMenu && <ChevronDown data-chevron className="h-3.5 w-3.5" aria-hidden />}
    </button>
  );
}
