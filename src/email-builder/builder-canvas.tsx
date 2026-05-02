'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ReactNode } from 'react';
import { cn } from '../lib/utils.js';
import { BlockRenderer } from './block-renderer.js';
import type { DevicePreview, EmailBlock, EmailBuilderLabels } from './types.js';

interface BuilderCanvasProps {
  blocks: EmailBlock[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
  device: DevicePreview;
  labels: EmailBuilderLabels;
  /** Optional content to render above the empty state — typically the palette CTA. */
  emptyStateAction?: ReactNode;
  /** Per-block floating bar; rendered near the selected block. */
  renderFloatingBar?: (block: EmailBlock) => ReactNode;
}

const DEVICE_WIDTHS: Record<DevicePreview, number> = { desktop: 600, mobile: 375 };

export function BuilderCanvas({
  blocks,
  selectedBlockId,
  onSelectBlock,
  device,
  labels,
  emptyStateAction,
  renderFloatingBar,
}: BuilderCanvasProps) {
  return (
    <div
      data-slot="email-builder-canvas"
      className="flex h-full w-full flex-col items-center overflow-y-auto bg-muted/40 p-6"
    >
      <div
        data-slot="email-builder-canvas-frame"
        className="rounded-md border border-border bg-background text-left shadow-sm transition-all"
        style={{ width: '100%', maxWidth: DEVICE_WIDTHS[device] }}
      >
        {blocks.length === 0 ? (
          <EmptyState labels={labels} action={emptyStateAction} />
        ) : (
          blocks.map((block) => (
            <SortableBlock
              key={block.id}
              block={block}
              selected={block.id === selectedBlockId}
              onSelect={() => onSelectBlock(block.id)}
              renderFloatingBar={renderFloatingBar}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface SortableBlockProps {
  block: EmailBlock;
  selected: boolean;
  onSelect: () => void;
  renderFloatingBar?: (block: EmailBlock) => ReactNode;
}

function SortableBlock({ block, selected, onSelect, renderFloatingBar }: SortableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
    data: { kind: 'block', blockId: block.id },
  });
  // dnd-kit injects role="button" + tabIndex by default; strip those so we don't
  // create nested interactive controls (the inner select <button> handles a11y).
  const { role: _role, tabIndex: _tabIndex, ...sortableAttrs } = attributes;
  return (
    <div
      ref={setNodeRef}
      data-slot="email-builder-canvas-block"
      data-block-id={block.id}
      data-selected={selected ? 'true' : undefined}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'group relative cursor-grab transition-shadow',
        selected && 'ring-2 ring-primary ring-inset',
        isDragging && 'z-10 opacity-60'
      )}
      {...sortableAttrs}
      {...listeners}
    >
      <BlockRenderer block={block} />
      <button
        type="button"
        data-slot="email-builder-canvas-block-select"
        aria-label={`Select ${block.kind} block`}
        aria-pressed={selected}
        className={cn(
          'absolute inset-0 z-0 cursor-pointer bg-transparent outline-none',
          selected ? 'pointer-events-none' : 'pointer-events-auto'
        )}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      />
      {selected && renderFloatingBar ? (
        <>
          {/* biome-ignore lint/a11y/noStaticElementInteractions: positioning wrapper */}
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: handlers only stop propagation */}
          <div
            data-slot="email-builder-canvas-block-actions"
            className="-top-3 -translate-x-1/2 absolute left-1/2 z-10"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {renderFloatingBar(block)}
          </div>
        </>
      ) : null}
    </div>
  );
}

function EmptyState({ labels, action }: { labels: EmailBuilderLabels; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="font-semibold text-base text-foreground">{labels.emptyTitle}</div>
      <p className="max-w-sm text-muted-foreground text-sm">{labels.emptyDescription}</p>
      {action ? <div className="pt-2">{action}</div> : null}
    </div>
  );
}
