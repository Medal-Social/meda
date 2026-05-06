import type { MarketingCTAProps } from './types.js';
import { cx } from './utils.js';

export function MarketingCTA({ eyebrow, title, subtitle, ctas, className }: MarketingCTAProps) {
  return (
    <section className={cx('mx-auto w-full max-w-4xl px-6 py-24 text-center', className)}>
      {eyebrow && <p className="mb-3 text-sm font-semibold text-primary">{eyebrow}</p>}
      <h2 className="mx-auto max-w-3xl text-4xl font-semibold sm:text-5xl">{title}</h2>
      {subtitle && (
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
          {subtitle}
        </p>
      )}
      {ctas && <div className="mt-8 flex flex-wrap items-center justify-center gap-3">{ctas}</div>}
    </section>
  );
}
