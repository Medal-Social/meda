import type { MarketingBentoGridProps } from './types.js';
import { cx } from './utils.js';

const COLS = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  6: 'grid-cols-6',
  12: 'grid-cols-12',
} as const;

export function MarketingBentoGrid({ cols = 12, children, className }: MarketingBentoGridProps) {
  return (
    <section className={cx('mx-auto w-full max-w-6xl px-6 py-16', className)}>
      <div className={cx('grid gap-4', COLS[cols])}>{children}</div>
    </section>
  );
}
