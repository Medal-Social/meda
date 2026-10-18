'use client';

import { useEffect, useState } from 'react';

export interface LiveStatusProps {
  /** The sentence to announce; `null` empties the region. */
  text: string | null;
  /** Visually hidden by default. */
  className?: string;
}

/**
 * A polite live region that is mounted EMPTY and filled after mount.
 *
 * Screen readers announce a change inside a live region they already know
 * about; a region that arrives with its text already in it is often read as
 * nothing at all. So the text lands one commit after the element does.
 */
export function LiveStatus({ text, className = 'sr-only' }: LiveStatusProps) {
  const [shown, setShown] = useState<string | null>(null);
  useEffect(() => {
    setShown(text);
  }, [text]);
  return (
    <p role="status" aria-live="polite" className={className}>
      {shown}
    </p>
  );
}
