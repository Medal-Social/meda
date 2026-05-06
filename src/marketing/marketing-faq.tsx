'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import type { MarketingFAQProps } from './types.js';
import { cx } from './utils.js';

export function MarketingFAQ({
  eyebrow,
  title,
  items,
  defaultOpenId,
  className,
}: MarketingFAQProps) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId ?? null);

  return (
    <section className={cx('mx-auto w-full max-w-3xl px-6 py-16', className)}>
      {(eyebrow || title) && (
        <div className="mb-10 text-center">
          {eyebrow && <p className="text-sm font-semibold text-primary">{eyebrow}</p>}
          {title && <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">{title}</h2>}
        </div>
      )}
      <ul className="space-y-3">
        {items.map((item) => {
          const open = openId === item.id;
          return (
            <li key={item.id} className="rounded-2xl border border-border bg-card">
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setOpenId(open ? null : item.id)}
                className="flex w-full items-center justify-between px-5 py-4 text-left text-base font-medium"
              >
                {item.question}
                <ChevronDown
                  className={cx('h-4 w-4 transition', open && 'rotate-180')}
                  aria-hidden
                />
              </button>
              {open && (
                <div className="border-t border-border px-5 py-4 text-sm text-muted-foreground">
                  {item.answer}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
