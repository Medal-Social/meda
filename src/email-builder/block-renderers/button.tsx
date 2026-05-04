'use client';

import type { CSSProperties } from 'react';
import type { ButtonBlockProps } from '../types.js';

const SIZES: Record<'sm' | 'md' | 'lg', { paddingX: number; paddingY: number; fontSize: number }> =
  {
    sm: { paddingX: 16, paddingY: 8, fontSize: 14 },
    md: { paddingX: 24, paddingY: 12, fontSize: 16 },
    lg: { paddingX: 32, paddingY: 16, fontSize: 18 },
  };

export function ButtonBlock({ props }: { props: ButtonBlockProps }) {
  const s = SIZES[props.size];
  const wrapperStyle: CSSProperties = {
    padding: `${props.padding.top}px ${props.padding.right}px ${props.padding.bottom}px ${props.padding.left}px`,
    textAlign: props.alignment,
  };
  const linkStyle: CSSProperties = {
    display: 'inline-block',
    backgroundColor: props.backgroundColor,
    color: props.textColor,
    borderRadius: props.borderRadius,
    padding: `${s.paddingY}px ${s.paddingX}px`,
    fontSize: s.fontSize,
    fontWeight: 600,
    textDecoration: 'none',
    width: props.fullWidth ? '100%' : undefined,
  };
  return (
    <div data-slot="email-block-button" style={wrapperStyle}>
      <a href={props.url} style={linkStyle} rel="noopener noreferrer">
        {props.text}
      </a>
    </div>
  );
}
