'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { isValidElement } from 'react';
import { cn } from '../lib/utils.js';
function isIconComponent(icon) {
    if (typeof icon === 'function')
        return true;
    if (!icon || typeof icon !== 'object')
        return false;
    return '$$typeof' in icon && !isValidElement(icon);
}
function renderIcon(icon) {
    if (!icon)
        return null;
    if (isIconComponent(icon)) {
        const Icon = icon;
        return _jsx(Icon, { "data-testid": "empty-state-icon", className: "size-10", "aria-hidden": "true" });
    }
    return (_jsx("span", { "data-testid": "empty-state-icon", "aria-hidden": "true", className: "inline-flex", children: icon }));
}
export function EmptyState({ icon, title, description, action, variant = 'default', className, ...props }) {
    return (_jsxs("div", { "data-slot": "empty-state", "data-variant": variant, className: cn('flex flex-col items-center justify-center text-center', variant === 'default' && 'px-6 py-16', variant === 'panel' && 'px-4 py-10', variant === 'inline' && 'px-3 py-6', className), ...props, children: [icon ? (_jsx("div", { "data-slot": "empty-state-icon", className: cn('mb-4 inline-flex items-center justify-center rounded-md text-muted-foreground', variant === 'inline' ? 'size-9' : 'size-12'), children: renderIcon(icon) })) : null, _jsx("h3", { "data-slot": "empty-state-title", className: cn('font-semibold text-foreground', variant === 'default' && 'text-lg', variant === 'panel' && 'text-base', variant === 'inline' && 'text-sm'), children: title }), description ? (_jsx("p", { "data-slot": "empty-state-description", className: cn('mt-1 max-w-sm text-muted-foreground', variant === 'inline' ? 'text-xs' : 'text-sm'), children: description })) : null, action ? (_jsx("div", { "data-slot": "empty-state-action", className: "mt-5", children: action })) : null] }));
}
