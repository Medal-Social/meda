'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ChevronDown, ChevronUp, Copy, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils.js';
/** Per-block floating action bar. Rendered next to the selected block. */
export function FloatingBar({ labels, canMoveUp, canMoveDown, onMoveUp, onMoveDown, onDuplicate, onDelete, }) {
    const btnClass = 'inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40';
    return (_jsxs("div", { "data-slot": "email-builder-floating-bar", className: "inline-flex rounded-md border border-input bg-background p-0.5 shadow-sm", children: [_jsx("button", { type: "button", onClick: onMoveUp, disabled: !canMoveUp, "aria-label": labels.moveUp, className: btnClass, children: _jsx(ChevronUp, { className: "size-4", "aria-hidden": true }) }), _jsx("button", { type: "button", onClick: onMoveDown, disabled: !canMoveDown, "aria-label": labels.moveDown, className: btnClass, children: _jsx(ChevronDown, { className: "size-4", "aria-hidden": true }) }), _jsx("button", { type: "button", onClick: onDuplicate, "aria-label": labels.duplicateBlock, className: btnClass, children: _jsx(Copy, { className: "size-4", "aria-hidden": true }) }), _jsx("button", { type: "button", onClick: onDelete, "aria-label": labels.deleteBlock, className: cn(btnClass, 'hover:bg-destructive/10 hover:text-destructive'), children: _jsx(Trash2, { className: "size-4", "aria-hidden": true }) })] }));
}
