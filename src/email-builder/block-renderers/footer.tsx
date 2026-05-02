'use client';

import type { CSSProperties } from 'react';
import type { FooterBlockProps } from '../types.js';

export function FooterBlock({ props }: { props: FooterBlockProps }) {
  const wrapperStyle: CSSProperties = {
    padding: `${props.padding.top}px ${props.padding.right}px ${props.padding.bottom}px ${props.padding.left}px`,
    textAlign: props.alignment,
    color: props.textColor,
    fontSize: props.fontSize,
    lineHeight: 1.5,
  };
  return (
    <div data-slot="email-block-footer" style={wrapperStyle}>
      {props.companyName ? <div>{props.companyName}</div> : null}
      {props.address ? <div>{props.address}</div> : null}
      {props.customText ? <div>{props.customText}</div> : null}
      {props.unsubscribeText ? (
        <div style={{ marginTop: 8 }}>
          <a href="#unsubscribe" style={{ color: props.textColor, textDecoration: 'underline' }}>
            {props.unsubscribeText}
          </a>
        </div>
      ) : null}
    </div>
  );
}
