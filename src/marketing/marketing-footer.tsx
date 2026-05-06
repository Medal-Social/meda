import type { MarketingFooterProps } from './types.js';
import { cx } from './utils.js';

export function MarketingFooter({
  brand,
  tagline,
  columns = [],
  bottomSlot,
  className,
}: MarketingFooterProps) {
  return (
    <div className={cx('border-t border-border bg-background', className)}>
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-16 md:grid-cols-12">
        <div className="md:col-span-4 space-y-3">
          <div className="text-lg font-semibold">{brand}</div>
          {tagline && <p className="max-w-sm text-sm text-muted-foreground">{tagline}</p>}
        </div>
        {columns.map((col, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: stable column order, titles may be ReactNode
          <div key={i} className="md:col-span-2 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">{col.title}</h3>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {bottomSlot && (
        <div className="border-t border-border">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 text-xs text-muted-foreground">
            {bottomSlot}
          </div>
        </div>
      )}
    </div>
  );
}
