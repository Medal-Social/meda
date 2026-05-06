'use client';

import type { MarketingMegaMenuProps } from './types.js';
import { cx } from './utils.js';

export function MarketingMegaMenu({
  triggerId,
  open,
  onOpenChange,
  features,
  children,
  className,
}: MarketingMegaMenuProps) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-labelledby={triggerId}
      onMouseLeave={() => onOpenChange(false)}
      className={cx(
        'absolute left-1/2 top-full mt-3 w-[min(960px,calc(100vw-32px))] -translate-x-1/2 rounded-3xl border border-border bg-card p-6 shadow-2xl backdrop-blur',
        className
      )}
    >
      {children ?? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features?.map((f) => (
            <li key={f.id}>
              <a
                href={f.href ?? '#'}
                className="flex items-start gap-3 rounded-xl p-3 hover:bg-muted/40"
              >
                {f.icon && (
                  <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {f.icon}
                  </span>
                )}
                <span>
                  <span className="block text-sm font-semibold">{f.title}</span>
                  {f.description && (
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {f.description}
                    </span>
                  )}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
