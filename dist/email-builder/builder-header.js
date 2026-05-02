'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Download } from 'lucide-react';
import { cn } from '../lib/utils.js';
import { ViewControls } from './view-controls.js';
export function BuilderHeader({ device, onDeviceChange, onExport, labels }) {
    return (_jsxs("header", { "data-slot": "email-builder-header", className: "flex h-12 items-center justify-between gap-2 border-border border-b bg-background px-4", children: [_jsx("div", { className: "font-semibold text-foreground text-sm", children: labels.preview }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(ViewControls, { device: device, onDeviceChange: onDeviceChange, desktopLabel: labels.desktopPreview, mobileLabel: labels.mobilePreview }), _jsxs("button", { type: "button", onClick: onExport, className: cn('inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 font-medium text-sm', 'hover:bg-accent hover:text-accent-foreground'), children: [_jsx(Download, { className: "size-4", "aria-hidden": true }), labels.exportHtml] })] })] }));
}
