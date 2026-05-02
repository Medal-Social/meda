'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Monitor, Smartphone } from 'lucide-react';
import { cn } from '../lib/utils.js';
/** Toggle between desktop and mobile preview modes. */
export function ViewControls({ device, onDeviceChange, desktopLabel, mobileLabel, }) {
    return (_jsxs("div", { role: "radiogroup", "aria-label": "Preview width", "data-slot": "email-builder-view-controls", className: "inline-flex rounded-md border border-input p-0.5", children: [_jsx("button", { type: "button", role: "radio", "aria-checked": device === 'desktop', "aria-label": desktopLabel, onClick: () => onDeviceChange('desktop'), className: cn('inline-flex h-9 w-10 items-center justify-center rounded', device === 'desktop'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent'), children: _jsx(Monitor, { className: "size-4", "aria-hidden": true }) }), _jsx("button", { type: "button", role: "radio", "aria-checked": device === 'mobile', "aria-label": mobileLabel, onClick: () => onDeviceChange('mobile'), className: cn('inline-flex h-9 w-10 items-center justify-center rounded', device === 'mobile'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent'), children: _jsx(Smartphone, { className: "size-4", "aria-hidden": true }) })] }));
}
