import type { MarketingTrustBarProps } from './types.js';
import { cx } from './utils.js';

export function MarketingTrustBar({ eyebrow, title, stats, className }: MarketingTrustBarProps) {
  return (
    <section className={cx('mx-auto w-full max-w-6xl px-6 py-16', className)}>
      {(eyebrow || title) && (
        <div className="mb-10 flex flex-col items-center gap-2 text-center">
          {eyebrow && <p className="text-sm font-semibold text-primary">{eyebrow}</p>}
          {title && <h2 className="text-2xl font-semibold sm:text-3xl">{title}</h2>}
        </div>
      )}
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <li
            // biome-ignore lint/suspicious/noArrayIndexKey: stable stat order, values may be ReactNode
            key={i}
            className="rounded-2xl border border-border bg-card p-6 text-card-foreground"
          >
            <div className="text-3xl font-semibold tracking-tight">{s.value}</div>
            <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
            {s.caption && <div className="mt-2 text-xs text-muted-foreground">{s.caption}</div>}
          </li>
        ))}
      </ul>
    </section>
  );
}
