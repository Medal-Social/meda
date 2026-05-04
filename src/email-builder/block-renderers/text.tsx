'use client';

import type { CSSProperties } from 'react';
import type { TextBlockProps } from '../types.js';

export function TextBlock({ props }: { props: TextBlockProps }) {
  const wrapperStyle: CSSProperties = {
    padding: `${props.padding.top}px ${props.padding.right}px ${props.padding.bottom}px ${props.padding.left}px`,
    textAlign: props.alignment,
    color: props.color,
    fontSize: props.fontSize,
    fontWeight: props.fontWeight,
    fontFamily: props.fontFamily || undefined,
    lineHeight: 1.55,
    wordBreak: 'break-word',
  };
  // Render as paragraphs split on blank lines.
  const paragraphs = props.content.split(/\n{2,}/);
  return (
    <div data-slot="email-block-text" style={wrapperStyle}>
      {paragraphs.map((para, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: stable ordering for static content
        <p key={i} style={{ margin: i > 0 ? '12px 0 0 0' : 0 }}>
          {para.split('\n').map((line, lineIdx, lines) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: stable ordering for static content
            <span key={lineIdx}>
              {line}
              {lineIdx < lines.length - 1 ? <br /> : null}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}
