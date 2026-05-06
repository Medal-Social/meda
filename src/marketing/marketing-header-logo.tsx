import type { ReactNode } from 'react';
import { cx } from './utils.js';

export interface MarketingHeaderLogoProps {
  mark?: ReactNode;
  word?: ReactNode;
  href?: string;
  className?: string;
}

export function MarketingHeaderLogo({
  mark,
  word,
  href = '/',
  className,
}: MarketingHeaderLogoProps) {
  return (
    <a
      href={href}
      className={cx('flex items-center gap-2 font-semibold tracking-tight', className)}
    >
      {mark}
      {word && <span>{word}</span>}
    </a>
  );
}
