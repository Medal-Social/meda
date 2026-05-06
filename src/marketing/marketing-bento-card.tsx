import type { ElementType } from 'react';
import type { MarketingBentoCardProps } from './types.js';
import { cx } from './utils.js';

const COL_SPAN = {
  1: 'col-span-1',
  2: 'col-span-2 sm:col-span-2',
  3: 'col-span-3 sm:col-span-3',
  4: 'col-span-4 sm:col-span-4',
  6: 'col-span-6 sm:col-span-6',
  12: 'col-span-12',
} as const;

const ROW_SPAN = {
  1: 'row-span-1',
  2: 'row-span-2',
  3: 'row-span-3',
} as const;

const PADDING = {
  default: 'p-6',
  feature: 'p-8',
  compact: 'p-4',
} as const;

export function MarketingBentoCard({
  colSpan = 4,
  rowSpan = 1,
  variant = 'default',
  icon,
  title,
  description,
  children,
  href,
  className,
}: MarketingBentoCardProps) {
  const Tag: ElementType = href ? 'a' : 'div';
  return (
    <Tag
      data-bento-card
      {...(href ? { href } : {})}
      className={cx(
        'rounded-2xl border border-border bg-card text-card-foreground transition',
        PADDING[variant],
        COL_SPAN[colSpan],
        ROW_SPAN[rowSpan],
        href && 'hover:border-primary/40 hover:bg-card/80',
        className
      )}
    >
      {icon && (
        <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
      )}
      {title && <h3 className="text-lg font-semibold">{title}</h3>}
      {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
      {children}
    </Tag>
  );
}
