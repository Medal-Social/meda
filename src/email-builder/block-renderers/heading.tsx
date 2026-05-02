'use client';

import type { CSSProperties } from 'react';
import { createElement } from 'react';
import type { HeadingBlockProps } from '../types.js';

export function HeadingBlock({ props }: { props: HeadingBlockProps }) {
  const tag = `h${props.level}` as 'h1' | 'h2' | 'h3';
  const style: CSSProperties = {
    margin: 0,
    color: props.color,
    fontSize: props.fontSize,
    fontWeight: props.fontWeight,
    fontFamily: props.fontFamily || undefined,
    lineHeight: 1.3,
  };
  const wrapperStyle: CSSProperties = {
    padding: `${props.padding.top}px ${props.padding.right}px ${props.padding.bottom}px ${props.padding.left}px`,
    textAlign: props.alignment,
  };
  return (
    <div data-slot="email-block-heading" style={wrapperStyle}>
      {createElement(tag, { style }, props.text)}
    </div>
  );
}
