import type { MarketingShellProps } from './types.js';
import { cx } from './utils.js';

export function MarketingShell({
  banner,
  header,
  footer,
  children,
  className,
}: MarketingShellProps) {
  return (
    <div className={cx('flex min-h-screen flex-col bg-background text-foreground', className)}>
      {banner && <div className="w-full">{banner}</div>}
      {header && <header className="sticky top-4 z-40 px-4 sm:px-6">{header}</header>}
      <main className="flex-1">{children}</main>
      {footer && <footer className="mt-auto">{footer}</footer>}
    </div>
  );
}
