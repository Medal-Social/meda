import type { MarketingNumberedFeaturesProps } from './types.js';
import { cx } from './utils.js';

export function MarketingNumberedFeatures({
  eyebrow,
  title,
  features,
  className,
}: MarketingNumberedFeaturesProps) {
  return (
    <section className={cx('mx-auto w-full max-w-6xl px-6 py-16', className)}>
      {(eyebrow || title) && (
        <div className="mb-12 flex flex-col items-center gap-2 text-center">
          {eyebrow && <p className="text-sm font-semibold text-primary">{eyebrow}</p>}
          {title && <h2 className="max-w-3xl text-3xl font-semibold sm:text-4xl">{title}</h2>}
        </div>
      )}
      <ol className="grid gap-6 md:grid-cols-3">
        {features.map((f) => (
          <li key={f.id} className="rounded-2xl border border-border bg-card p-6">
            <div className="text-sm font-semibold text-primary">{f.index}</div>
            <h3 className="mt-2 text-xl font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
