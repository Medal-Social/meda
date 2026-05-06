import type { MarketingHeroProps } from './types.js';
import { cx } from './utils.js';

export function MarketingHero({
  eyebrow,
  headline,
  subtitle,
  ctas,
  meta,
  productMockup,
  className,
}: MarketingHeroProps) {
  return (
    <section className={cx('mx-auto w-full max-w-6xl px-6 pt-16 pb-24', className)}>
      <div className="flex flex-col items-center gap-6 text-center">
        {eyebrow}
        <h1 className="max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl lg:text-[80px]">
          {headline}
        </h1>
        {subtitle && (
          <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">{subtitle}</p>
        )}
        {ctas && (
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">{ctas}</div>
        )}
        {meta && <p className="text-xs text-muted-foreground">{meta}</p>}
      </div>
      {productMockup && (
        <div className="mt-16 overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
          {productMockup}
        </div>
      )}
    </section>
  );
}
