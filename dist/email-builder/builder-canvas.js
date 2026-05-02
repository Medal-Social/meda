'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../lib/utils.js';
import { BlockRenderer } from './block-renderer.js';
const DEVICE_WIDTHS = { desktop: 600, mobile: 375 };
export function BuilderCanvas({ blocks, selectedBlockId, onSelectBlock, device, labels, emptyStateAction, renderFloatingBar, }) {
    return (_jsx("div", { "data-slot": "email-builder-canvas", className: "flex h-full w-full flex-col items-center overflow-y-auto bg-muted/40 p-6", children: _jsx("div", { "data-slot": "email-builder-canvas-frame", className: "rounded-md border border-border bg-background text-left shadow-sm transition-all", style: { width: '100%', maxWidth: DEVICE_WIDTHS[device] }, children: blocks.length === 0 ? (_jsx(EmptyState, { labels: labels, action: emptyStateAction })) : (blocks.map((block) => (_jsx(SortableBlock, { block: block, selected: block.id === selectedBlockId, onSelect: () => onSelectBlock(block.id), renderFloatingBar: renderFloatingBar }, block.id)))) }) }));
}
function SortableBlock({ block, selected, onSelect, renderFloatingBar }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: block.id,
        data: { kind: 'block', blockId: block.id },
    });
    // dnd-kit injects role="button" + tabIndex by default; strip those so we don't
    // create nested interactive controls (the inner select <button> handles a11y).
    const { role: _role, tabIndex: _tabIndex, ...sortableAttrs } = attributes;
    return (_jsxs("div", { ref: setNodeRef, "data-slot": "email-builder-canvas-block", "data-block-id": block.id, "data-selected": selected ? 'true' : undefined, style: { transform: CSS.Transform.toString(transform), transition }, className: cn('group relative cursor-grab transition-shadow', selected && 'ring-2 ring-primary ring-inset', isDragging && 'z-10 opacity-60'), ...sortableAttrs, ...listeners, children: [_jsx(BlockRenderer, { block: block }), _jsx("button", { type: "button", "data-slot": "email-builder-canvas-block-select", "aria-label": `Select ${block.kind} block`, "aria-pressed": selected, className: cn('absolute inset-0 z-0 cursor-pointer bg-transparent outline-none', selected ? 'pointer-events-none' : 'pointer-events-auto'), onClick: (e) => {
                    e.stopPropagation();
                    onSelect();
                } }), selected && renderFloatingBar ? (_jsx(_Fragment, { children: _jsx("div", { "data-slot": "email-builder-canvas-block-actions", className: "-top-3 -translate-x-1/2 absolute left-1/2 z-10", onClick: (e) => e.stopPropagation(), onPointerDown: (e) => e.stopPropagation(), children: renderFloatingBar(block) }) })) : null] }));
}
function EmptyState({ labels, action }) {
    return (_jsxs("div", { className: "flex flex-col items-center justify-center gap-3 px-6 py-16 text-center", children: [_jsx("div", { className: "font-semibold text-base text-foreground", children: labels.emptyTitle }), _jsx("p", { className: "max-w-sm text-muted-foreground text-sm", children: labels.emptyDescription }), action ? _jsx("div", { className: "pt-2", children: action }) : null] }));
}
