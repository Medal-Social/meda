'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useMemo, useState } from 'react';
import { cn } from '../lib/utils.js';
import { BlockPalette } from './block-palette.js';
import { createBlock } from './block-registry.js';
import { BuilderCanvas } from './builder-canvas.js';
import { BuilderHeader } from './builder-header.js';
import { BuilderLeftTabs } from './builder-left-tabs.js';
import { EnvelopeCard } from './envelope-card.js';
import { FloatingBar } from './floating-bar.js';
import { addBlock, duplicateBlock, moveBlock, removeBlock, updateBlockProps, } from './internal/builder-state-utils.js';
import { BuilderDndWrapper } from './internal/dnd-wrapper.js';
import { MobileDrawer } from './mobile-drawers.js';
import { MobileTabBar } from './mobile-tab-bar.js';
import { PropertyInspector } from './property-inspector.js';
import { renderToEmailHtml } from './render-to-email-html.js';
import { defaultEmailBuilderLabels, } from './types.js';
export function EmailBuilder({ document, onDocumentChange, brand, renderMediaPicker, renderSavedBlocks, renderTextEditor, onExportHtml, labels: labelsProp, className, initialDevice = 'desktop', }) {
    const labels = useMemo(() => ({ ...defaultEmailBuilderLabels, ...(labelsProp ?? {}) }), [labelsProp]);
    const [selectedBlockId, setSelectedBlockId] = useState(null);
    const [device, setDevice] = useState(initialDevice);
    const [mobilePane, setMobilePane] = useState(null);
    const selectedBlock = useMemo(() => document.blocks.find((b) => b.id === selectedBlockId) ?? null, [document.blocks, selectedBlockId]);
    const handleAddBlock = useCallback((kind) => {
        const block = createBlock(kind);
        onDocumentChange(addBlock(document, block));
        setSelectedBlockId(block.id);
        setMobilePane(null);
    }, [document, onDocumentChange]);
    const handleSavedBlockPick = useCallback((block) => {
        onDocumentChange(addBlock(document, block));
        setSelectedBlockId(block.id);
        setMobilePane(null);
    }, [document, onDocumentChange]);
    const handlePropChange = useCallback((blockId, patch) => {
        onDocumentChange(updateBlockProps(document, blockId, patch));
    }, [document, onDocumentChange]);
    const handleDelete = useCallback((blockId) => {
        onDocumentChange(removeBlock(document, blockId));
        setSelectedBlockId(null);
    }, [document, onDocumentChange]);
    const handleDuplicate = useCallback((blockId) => {
        onDocumentChange(duplicateBlock(document, blockId));
    }, [document, onDocumentChange]);
    const handleMove = useCallback((blockId, delta) => {
        const idx = document.blocks.findIndex((b) => b.id === blockId);
        if (idx === -1)
            return;
        onDocumentChange(moveBlock(document, idx, idx + delta));
    }, [document, onDocumentChange]);
    const handleDragEnd = useCallback((event) => {
        const { active, over } = event;
        if (!over || active.id === over.id)
            return;
        const fromIndex = document.blocks.findIndex((b) => b.id === active.id);
        const toIndex = document.blocks.findIndex((b) => b.id === over.id);
        if (fromIndex === -1 || toIndex === -1)
            return;
        onDocumentChange(moveBlock(document, fromIndex, toIndex));
    }, [document, onDocumentChange]);
    const handleExport = useCallback(() => {
        const html = renderToEmailHtml(document, brand ? { brand } : undefined);
        if (onExportHtml) {
            onExportHtml(html);
            return;
        }
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
    const blocksTabContent = (_jsxs("div", { className: "flex flex-col gap-2", children: [_jsx(BlockPalette, { onPick: handleAddBlock }), renderSavedBlocks ? (_jsx("div", { "data-slot": "email-builder-saved-blocks-slot", className: "border-border border-t p-2", children: renderSavedBlocks({ onPick: handleSavedBlockPick }) })) : null] }));
    const envelopeTabContent = (_jsx(EnvelopeCard, { envelope: document.envelope, onChange: (envelope) => onDocumentChange({ ...document, envelope }) }));
    return (_jsxs("div", { "data-slot": "email-builder", className: cn('relative flex h-full min-h-[600px] w-full flex-col bg-background', className), children: [_jsx(BuilderHeader, { device: device, onDeviceChange: setDevice, onExport: handleExport, labels: labels }), _jsx(BuilderDndWrapper, { blockIds: blockIds, onDragEnd: handleDragEnd, children: _jsxs("div", { className: "flex min-h-0 flex-1", children: [_jsx("aside", { "data-slot": "email-builder-left", "aria-label": labels.blocksTab, className: "hidden w-72 shrink-0 border-border border-r md:block", children: _jsx(BuilderLeftTabs, { labels: labels, blocksContent: blocksTabContent, envelopeContent: envelopeTabContent }) }), _jsx("main", { className: "min-w-0 flex-1", children: _jsx(BuilderCanvas, { blocks: document.blocks, selectedBlockId: selectedBlockId, onSelectBlock: setSelectedBlockId, device: device, labels: labels, renderFloatingBar: (block) => (_jsx(FloatingBar, { labels: labels, canMoveUp: document.blocks[0]?.id !== block.id, canMoveDown: document.blocks[document.blocks.length - 1]?.id !== block.id, onMoveUp: () => handleMove(block.id, -1), onMoveDown: () => handleMove(block.id, 1), onDuplicate: () => handleDuplicate(block.id), onDelete: () => handleDelete(block.id) })) }) }), _jsx("aside", { "data-slot": "email-builder-right", "aria-label": labels.openInspector, className: "hidden w-80 shrink-0 overflow-y-auto border-border border-l md:block", children: _jsx(PropertyInspector, { block: selectedBlock, onChange: (id, patch) => handlePropChange(id, patch), emptyContent: labels.inspectorEmpty, renderMediaPicker: renderMediaPicker, renderTextEditor: renderTextEditor }) })] }) }), _jsx(MobileTabBar, { labels: labels, onOpenBlocks: () => setMobilePane('blocks'), onOpenInspector: () => setMobilePane('inspector'), onOpenSettings: () => setMobilePane('settings') }), _jsx(MobileDrawer, { open: mobilePane === 'blocks', onOpenChange: (o) => !o && setMobilePane(null), title: labels.blocksTab, children: blocksTabContent }), _jsx(MobileDrawer, { open: mobilePane === 'inspector', onOpenChange: (o) => !o && setMobilePane(null), title: labels.openInspector, children: _jsx(PropertyInspector, { block: selectedBlock, onChange: (id, patch) => handlePropChange(id, patch), emptyContent: labels.inspectorEmpty, renderMediaPicker: renderMediaPicker, renderTextEditor: renderTextEditor }) }), _jsx(MobileDrawer, { open: mobilePane === 'settings', onOpenChange: (o) => !o && setMobilePane(null), title: labels.envelopeTab, children: envelopeTabContent })] }));
}
// Re-exported for convenience.
export { renderToEmailHtml } from './render-to-email-html.js';
