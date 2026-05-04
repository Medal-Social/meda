'use client';

import { ImageOff } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { ImageBlockProps } from '../types.js';

export function ImageBlock({ props }: { props: ImageBlockProps }) {
  const wrapperStyle: CSSProperties = {
    padding: `${props.padding.top}px ${props.padding.right}px ${props.padding.bottom}px ${props.padding.left}px`,
    textAlign: props.alignment,
  };
  if (!props.src) {
    return (
      <div data-slot="email-block-image" style={wrapperStyle}>
        <div
          className="mx-auto flex items-center justify-center rounded-md border border-border border-dashed bg-muted/50 text-muted-foreground"
          style={{
            width: '100%',
            maxWidth: props.width,
            height: 120,
          }}
        >
          <ImageOff className="size-6" aria-hidden />
          <span className="ml-2 text-sm">No image selected</span>
        </div>
      </div>
    );
  }
  const img = (
    <img
      src={props.src}
      alt={props.alt}
      width={props.width}
      height={props.height === 'auto' ? undefined : props.height}
      style={{ display: 'block', width: '100%', maxWidth: props.width, height: 'auto' }}
    />
  );
  return (
    <div data-slot="email-block-image" style={wrapperStyle}>
      {props.linkUrl ? (
        <a href={props.linkUrl} rel="noopener noreferrer">
          {img}
        </a>
      ) : (
        img
      )}
    </div>
  );
}
