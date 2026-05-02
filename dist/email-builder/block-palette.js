'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AlignLeft, Columns2, Image, Minus, MousePointerClick, Share2, Space, Type, } from 'lucide-react';
import { BLOCK_REGISTRY } from './block-registry.js';
const ICONS = {
    heading: Type,
    text: Type,
    image: Image,
    button: MousePointerClick,
    divider: Minus,
    spacer: Space,
    columns: Columns2,
    social: Share2,
    footer: AlignLeft,
};
/** Vertical button list of all available block kinds. */
export function BlockPalette({ onPick }) {
    return (_jsx("div", { "data-slot": "email-builder-palette", className: "flex flex-col gap-1.5 p-2", children: BLOCK_REGISTRY.map((meta) => {
            const Icon = ICONS[meta.kind];
            return (_jsxs("button", { type: "button", onClick: () => onPick(meta.kind), "data-slot": "email-builder-palette-item", "data-block-kind": meta.kind, className: "flex min-h-[44px] items-center gap-3 rounded-md border border-input bg-background p-2 text-left hover:bg-accent hover:text-accent-foreground", children: [_jsx(Icon, { className: "size-4 shrink-0 text-muted-foreground", "aria-hidden": true }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("div", { className: "font-medium text-sm", children: meta.label }), _jsx("div", { className: "truncate text-muted-foreground text-xs", children: meta.description })] })] }, meta.kind));
        }) }));
}
