'use client';

import type { DragEndEvent } from '@dnd-kit/core';
import { useCallback, useMemo, useState } from 'react';
import { cn } from '../lib/utils.js';
import { BlockPalette } from './block-palette.js';
import { createBlock } from './block-registry.js';
import { BuilderCanvas } from './builder-canvas.js';
import { BuilderHeader } from './builder-header.js';
import { BuilderLeftTabs } from './builder-left-tabs.js';
import { EnvelopeCard } from './envelope-card.js';
import { FloatingBar } from './floating-bar.js';
import {
  addBlock,
  duplicateBlock,
  moveBlock,
  removeBlock,
  updateBlockProps,
} from './internal/builder-state-utils.js';
import { BuilderDndWrapper } from './internal/dnd-wrapper.js';
import { MobileDrawer } from './mobile-drawers.js';
import { MobileTabBar } from './mobile-tab-bar.js';
import { PropertyInspector } from './property-inspector.js';
import { renderToEmailHtml } from './render-to-email-html.js';
import {
  type DevicePreview,
  defaultEmailBuilderLabels,
  type EmailBlock,
  type EmailBuilderProps,
} from './types.js';

export function EmailBuilder({
  document,
  onDocumentChange,
  brand,
  renderMediaPicker,
  renderSavedBlocks,
  renderTextEditor,
  onExportHtml,
  labels: labelsProp,
  className,
  initialDevice = 'desktop',
}: EmailBuilderProps) {
  const labels = useMemo(
    () => ({ ...defaultEmailBuilderLabels, ...(labelsProp ?? {}) }),
    [labelsProp]
  );
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [device, setDevice] = useState<DevicePreview>(initialDevice);
  const [mobilePane, setMobilePane] = useState<'blocks' | 'inspector' | 'settings' | null>(null);

  const selectedBlock = useMemo<EmailBlock | null>(
    () => document.blocks.find((b) => b.id === selectedBlockId) ?? null,
    [document.blocks, selectedBlockId]
  );

  const handleAddBlock = useCallback(
    (kind: Parameters<typeof createBlock>[0]) => {
      const block = createBlock(kind);
      onDocumentChange(addBlock(document, block));
      setSelectedBlockId(block.id);
      setMobilePane(null);
    },
    [document, onDocumentChange]
  );

  const handleSavedBlockPick = useCallback(
    (block: EmailBlock) => {
      onDocumentChange(addBlock(document, block));
      setSelectedBlockId(block.id);
      setMobilePane(null);
    },
    [document, onDocumentChange]
  );

  const handlePropChange = useCallback(
    (blockId: string, patch: Record<string, unknown>) => {
      onDocumentChange(updateBlockProps(document, blockId, patch));
    },
    [document, onDocumentChange]
  );

  const handleDelete = useCallback(
    (blockId: string) => {
      onDocumentChange(removeBlock(document, blockId));
      setSelectedBlockId(null);
    },
    [document, onDocumentChange]
  );

  const handleDuplicate = useCallback(
    (blockId: string) => {
      onDocumentChange(duplicateBlock(document, blockId));
    },
    [document, onDocumentChange]
  );

  const handleMove = useCallback(
    (blockId: string, delta: -1 | 1) => {
      const idx = document.blocks.findIndex((b) => b.id === blockId);
      /* v8 ignore next -- defensive guard; floating bar only renders for blocks that exist in document */
      if (idx === -1) return;
      onDocumentChange(moveBlock(document, idx, idx + delta));
    },
    [document, onDocumentChange]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const fromIndex = document.blocks.findIndex((b) => b.id === active.id);
      const toIndex = document.blocks.findIndex((b) => b.id === over.id);
      if (fromIndex === -1 || toIndex === -1) return;
      onDocumentChange(moveBlock(document, fromIndex, toIndex));
    },
    [document, onDocumentChange]
  );

  const handleExport = useCallback(() => {
    const html = renderToEmailHtml(document, brand ? { brand } : undefined);
    if (onExportHtml) {
      onExportHtml(html);
      return;
    }
    /* v8 ignore next -- typeof window guard is always true in jsdom; SSR-only branch */
    if (typeof window !== 'undefined') {
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `${document.envelope?.subject ?? 'email'}.html`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [brand, document, onExportHtml]);

  const blockIds = useMemo(() => document.blocks.map((b) => b.id), [document.blocks]);

  const blocksTabContent = (
    <div className="flex flex-col gap-2">
      <BlockPalette onPick={handleAddBlock} />
      {renderSavedBlocks ? (
        <div data-slot="email-builder-saved-blocks-slot" className="border-border border-t p-2">
          {renderSavedBlocks({ onPick: handleSavedBlockPick })}
        </div>
      ) : null}
    </div>
  );
  const envelopeTabContent = (
    <EnvelopeCard
      envelope={document.envelope}
      onChange={(envelope) => onDocumentChange({ ...document, envelope })}
    />
  );

  return (
    <div
      data-slot="email-builder"
      className={cn('relative flex h-full min-h-[600px] w-full flex-col bg-background', className)}
    >
      <BuilderHeader
        device={device}
        onDeviceChange={setDevice}
        onExport={handleExport}
        labels={labels}
      />
      <BuilderDndWrapper blockIds={blockIds} onDragEnd={handleDragEnd}>
        <div className="flex min-h-0 flex-1">
          {/* Left rail — hidden on mobile */}
          <aside
            data-slot="email-builder-left"
            aria-label={labels.blocksTab}
            className="hidden w-72 shrink-0 border-border border-r md:block"
          >
            <BuilderLeftTabs
              labels={labels}
              blocksContent={blocksTabContent}
              envelopeContent={envelopeTabContent}
            />
          </aside>
          {/* Canvas */}
          <main className="min-w-0 flex-1">
            <BuilderCanvas
              blocks={document.blocks}
              selectedBlockId={selectedBlockId}
              onSelectBlock={setSelectedBlockId}
              device={device}
              labels={labels}
              renderFloatingBar={(block) => (
                <FloatingBar
                  labels={labels}
                  canMoveUp={document.blocks[0]?.id !== block.id}
                  canMoveDown={document.blocks[document.blocks.length - 1]?.id !== block.id}
                  onMoveUp={() => handleMove(block.id, -1)}
                  onMoveDown={() => handleMove(block.id, 1)}
                  onDuplicate={() => handleDuplicate(block.id)}
                  onDelete={() => handleDelete(block.id)}
                />
              )}
            />
          </main>
          {/* Right rail — hidden on mobile */}
          <aside
            data-slot="email-builder-right"
            aria-label={labels.openInspector}
            className="hidden w-80 shrink-0 overflow-y-auto border-border border-l md:block"
          >
            <PropertyInspector
              block={selectedBlock}
              onChange={(id, patch) => handlePropChange(id, patch as Record<string, unknown>)}
              emptyContent={labels.inspectorEmpty}
              renderMediaPicker={renderMediaPicker}
              renderTextEditor={renderTextEditor}
            />
          </aside>
        </div>
      </BuilderDndWrapper>
      {/* Mobile chrome */}
      <MobileTabBar
        labels={labels}
        onOpenBlocks={() => setMobilePane('blocks')}
        onOpenInspector={() => setMobilePane('inspector')}
        onOpenSettings={() => setMobilePane('settings')}
      />
      <MobileDrawer
        open={mobilePane === 'blocks'}
        /* v8 ignore next -- vaul close events (swipe/overlay/escape) don't fire in jsdom */
        onOpenChange={(o) => !o && setMobilePane(null)}
        title={labels.blocksTab}
      >
        {blocksTabContent}
      </MobileDrawer>
      <MobileDrawer
        open={mobilePane === 'inspector'}
        /* v8 ignore next -- vaul close events (swipe/overlay/escape) don't fire in jsdom */
        onOpenChange={(o) => !o && setMobilePane(null)}
        title={labels.openInspector}
      >
        <PropertyInspector
          block={selectedBlock}
          /* v8 ignore next -- onChange is identical to the right-rail's; mobile drawer portal content is not exercised in jsdom */
          onChange={(id, patch) => handlePropChange(id, patch as Record<string, unknown>)}
          emptyContent={labels.inspectorEmpty}
          renderMediaPicker={renderMediaPicker}
          renderTextEditor={renderTextEditor}
        />
      </MobileDrawer>
      <MobileDrawer
        open={mobilePane === 'settings'}
        /* v8 ignore next -- vaul close events (swipe/overlay/escape) don't fire in jsdom */
        onOpenChange={(o) => !o && setMobilePane(null)}
        title={labels.envelopeTab}
      >
        {envelopeTabContent}
      </MobileDrawer>
    </div>
  );
}

// Re-exported for convenience.
export { renderToEmailHtml } from './render-to-email-html.js';
