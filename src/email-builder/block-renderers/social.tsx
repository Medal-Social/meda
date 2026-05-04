'use client';

import type { CSSProperties } from 'react';
import type { SocialBlockProps } from '../types.js';

export function SocialBlock({ props }: { props: SocialBlockProps }) {
  const visible = props.links.filter((l) => Boolean(l.url));
  const wrapperStyle: CSSProperties = {
    padding: `${props.padding.top}px ${props.padding.right}px ${props.padding.bottom}px ${props.padding.left}px`,
    textAlign: props.alignment,
  };
  return (
    <div data-slot="email-block-social" style={wrapperStyle}>
      <div
        style={{
          display: 'inline-flex',
          gap: props.spacing,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {visible.map((link, i) => (
          <a
            // biome-ignore lint/suspicious/noArrayIndexKey: link list is stable per render
            key={`${link.platform}-${i}`}
            href={link.url}
            rel="noopener noreferrer"
            aria-label={link.platform}
            className="inline-flex items-center justify-center rounded bg-muted px-3 py-1 text-foreground text-xs no-underline"
            style={{
              width: link.iconUrl ? props.iconSize : undefined,
              height: link.iconUrl ? props.iconSize : undefined,
              padding: link.iconUrl ? 0 : undefined,
            }}
          >
            {link.iconUrl ? (
              <img
                src={link.iconUrl}
                alt={link.platform}
                width={props.iconSize}
                height={props.iconSize}
                style={{ display: 'block' }}
              />
            ) : (
              link.platform
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
