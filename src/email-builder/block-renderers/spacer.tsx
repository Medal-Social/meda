'use client';

import type { SpacerBlockProps } from '../types.js';

export function SpacerBlock({ props }: { props: SpacerBlockProps }) {
  return (
    <div
      data-slot="email-block-spacer"
      aria-hidden
      style={{ height: props.height, width: '100%' }}
    />
  );
}
