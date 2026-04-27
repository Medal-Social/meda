'use client';

import { MarketingCtaList } from './marketing-cta-list.js';
import type { MarketingCalloutProps } from './types.js';
import { cx } from './utils.js';

export function MarketingCallout({
  eyebrow,
  title,
  description,
  children,
  ctas,
  variant = 'band',
  align = 'center',
  className,
}: MarketingCalloutProps) {
  const isCard = variant === 'card';

  return (
    <section
      className={cx(
        'relative overflow-hidden border border-border bg-card text-card-foreground',
        isCard ? 'rounded-lg px-6 py-8 shadow-sm' : 'px-6 py-14 sm:px-8 sm:py-16',
        className
      )}
    >
      <div
        className={cx(
          'mx-auto flex max-w-4xl flex-col gap-5',
          align === 'center' ? 'items-center text-center' : 'items-start text-left'
        )}
      >
        {eyebrow && <p className="text-sm font-semibold text-primary">{eyebrow}</p>}
        <h2 className="max-w-3xl text-3xl font-bold leading-tight text-foreground sm:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            {description}
          </p>
        )}
        {children && (
          <div className="max-w-2xl text-base leading-7 text-muted-foreground">{children}</div>
        )}
        <MarketingCtaList ctas={ctas} align={align} className="mt-1" />
      </div>
    </section>
  );
}
