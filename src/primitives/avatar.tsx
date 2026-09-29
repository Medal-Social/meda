'use client';

import { type ComponentProps, useCallback, useState } from 'react';
import { cn } from '../lib/utils.js';

export type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarProps extends Omit<ComponentProps<'span'>, 'children'> {
  /** Person or entity name. Drives the accessible name and the initials. */
  name: string;
  /** Image URL. Falls back to initials when missing or when it fails to load. */
  src?: string | null;
  /** Override the computed initials (e.g. a single brand letter). */
  initials?: string;
  size?: AvatarSize;
}

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-12 text-base',
};

/**
 * Up to two initials from a name, letters only: the first letter of the first
 * and of the last word. Digits, punctuation and emoji are ignored, so
 * "Ali (Medal) 2" gives "AM" and "  " gives "". Any script is supported via
 * Unicode letter classes ("Åse Øien" -> "ÅØ").
 */
export function getInitials(name: string): string {
  const words = name
    .split(/\s+/)
    .map((word) => word.replace(/[^\p{L}]/gu, ''))
    .filter(Boolean);
  if (words.length === 0) return '';
  const first = words[0] ?? '';
  const last = words.length > 1 ? (words[words.length - 1] ?? '') : '';
  return (Array.from(first)[0] ?? '').concat(Array.from(last)[0] ?? '').toLocaleUpperCase();
}

/**
 * Image avatar with an initials fallback. The wrapper carries `role="img"` +
 * `aria-label={name}`, so the name is announced once whether the photo or the
 * initials are showing.
 */
export function Avatar({ name, src, initials, size = 'md', className, ...props }: AvatarProps) {
  // Keyed by URL, so a new `src` automatically gets a fresh chance.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = Boolean(src) && failedSrc !== src;
  const text = initials ?? getInitials(name);

  // An SSR-rendered <img> can fail before React hydrates and attaches
  // onError; catch that case by inspecting the element once it mounts.
  const imageRef = useCallback(
    (image: HTMLImageElement | null) => {
      if (image?.complete && image.naturalWidth === 0 && src) setFailedSrc(src);
    },
    [src]
  );

  return (
    <span
      role="img"
      aria-label={name}
      data-slot="avatar"
      data-size={size}
      data-state={showImage ? 'image' : 'fallback'}
      className={cn(
        'relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-muted font-medium text-muted-foreground',
        SIZE_CLASSES[size],
        className
      )}
      {...props}
    >
      {showImage ? (
        <img
          ref={imageRef}
          src={src ?? undefined}
          alt=""
          decoding="async"
          loading="lazy"
          onError={() => setFailedSrc(src ?? null)}
          className="size-full object-cover"
        />
      ) : (
        <span aria-hidden="true" data-slot="avatar-fallback">
          {text}
        </span>
      )}
    </span>
  );
}
