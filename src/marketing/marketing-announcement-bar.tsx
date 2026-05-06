import type { ElementType } from 'react';
import type { MarketingAnnouncementBarProps } from './types.js';
import { cx } from './utils.js';

export function MarketingAnnouncementBar({
  href,
  icon,
  children,
  className,
}: MarketingAnnouncementBarProps) {
  const Tag: ElementType = href ? 'a' : 'span';
  return (
    <Tag
      {...(href ? { href } : {})}
      className={cx(
        'inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-4 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur',
        className
      )}
    >
      {icon}
      {children}
    </Tag>
  );
}
