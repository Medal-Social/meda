import type { ReactNode } from 'react';
import { cx } from './utils.js';

export interface MarketingHeaderLogoProps {
  mark?: ReactNode;
  word?: ReactNode;
  href?: string;
  /** Accessible name for the logo link. Falls back to `word` if it's a string, then to "Home". */
  label?: string;
  className?: string;
}

export function MarketingHeaderLogo({
  mark,
  word,
  href = '/',
  label,
  className,
}: MarketingHeaderLogoProps) {
  const accessibleName = label ?? (typeof word === 'string' ? word : undefined) ?? 'Home';
  return (
    <a
      href={href}
      aria-label={accessibleName}
      className={cx('flex items-center gap-2 font-semibold tracking-tight', className)}
    >
      {mark}
      {word && <span>{word}</span>}
    </a>
  );
}
