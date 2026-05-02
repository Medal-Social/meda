'use client';

import type { CSSProperties } from 'react';
import type { DividerBlockProps } from '../types.js';

export function DividerBlock({ props }: { props: DividerBlockProps }) {
  const wrapperStyle: CSSProperties = {
    padding: `${props.padding.top}px ${props.padding.right}px ${props.padding.bottom}px ${props.padding.left}px`,
  };
  const ruleStyle: CSSProperties = {
    width: `${props.width}%`,
    margin: '0 auto',
    borderTop: `${props.thickness}px ${props.style} ${props.color}`,
    height: 0,
  };
  return (
    <div data-slot="email-block-divider" style={wrapperStyle}>
      <div style={ruleStyle} />
    </div>
  );
}
