'use client';

import { useState } from 'react';
import { cn } from '../../lib/utils.js';

export interface AvatarProps {
  src?: string;
  displayName: string;
  className?: string;
}

function initialOf(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  return trimmed.charAt(0).toUpperCase();
}

/**
 * Internal avatar primitive used by post-preview platforms.
 * Plain `<img>` with an initials fallback; deliberately not exported
 * from the public surface so we don't lock consumers in. Consumers
 * who want a richer Avatar primitive should pull one from elsewhere.
 */
export function Avatar({ src, displayName, className }: AvatarProps) {
  const [errored, setErrored] = useState(false);
  const showFallback = !src || errored;

  return (
    <span
      data-slot="post-preview-avatar"
      className={cn(
        'inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-medium text-muted-foreground',
        className
      )}
    >
      {showFallback ? (
        <span role="img" aria-label={displayName}>
          {initialOf(displayName)}
        </span>
      ) : (
        <img
          src={src}
          alt={displayName}
          loading="lazy"
          decoding="async"
          onError={() => setErrored(true)}
          className="h-full w-full object-cover"
        />
      )}
    </span>
  );
}
