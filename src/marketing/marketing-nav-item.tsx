'use client';

import { ChevronDown } from 'lucide-react';
import type { MarketingNavItemDescriptor } from './types.js';
import { cx } from './utils.js';

export function MarketingNavItem({
  id,
  label,
  className,
  open = false,
  onToggle,
  ...rest
}: MarketingNavItemDescriptor & {
  className?: string;
  open?: boolean;
  onToggle?: () => void;
}) {
  if (rest.hasMenu) {
    return (
      <button
        type="button"
        data-nav-id={id}
        id={id}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={onToggle}
        className={cx(
          'inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-foreground/80 hover:text-foreground',
          className
        )}
      >
        {label}
        <ChevronDown
          data-chevron
          className={cx('h-3.5 w-3.5 transition', open && 'rotate-180')}
          aria-hidden
        />
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
