'use client';

import type { CSSProperties } from 'react';
import { getColumnWidths } from '../block-registry.js';
import { BlockRenderer } from '../block-renderer.js';
import type { ColumnsBlockProps, EmailBlock } from '../types.js';

export function ColumnsBlock({
  props,
  columnChildren,
}: {
  props: ColumnsBlockProps;
  columnChildren?: EmailBlock[][];
}) {
  const widths = getColumnWidths(props.layout);
  const wrapperStyle: CSSProperties = {
    padding: `${props.padding.top}px ${props.padding.right}px ${props.padding.bottom}px ${props.padding.left}px`,
    backgroundColor: props.backgroundColor !== 'transparent' ? props.backgroundColor : undefined,
    display: 'flex',
    flexDirection: props.mobileStacking ? undefined : 'row',
    gap: props.gap,
    alignItems:
      props.verticalAlignment === 'top'
        ? 'flex-start'
        : props.verticalAlignment === 'middle'
          ? 'center'
          : 'flex-end',
    flexWrap: 'wrap',
  };
  return (
    <div data-slot="email-block-columns" style={wrapperStyle}>
      {widths.map((w, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: column index is stable identity
          key={i}
          data-slot="email-block-columns-cell"
          style={{
            flex: `0 0 calc(${w}% - ${(props.gap * (widths.length - 1)) / widths.length}px)`,
            minWidth: 120,
          }}
        >
          {(columnChildren?.[i] ?? []).map((b) => (
            <BlockRenderer key={b.id} block={b} />
          ))}
        </div>
      ))}
    </div>
  );
}
