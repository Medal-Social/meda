'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { XIcon } from 'lucide-react';
import { cn } from '../../lib/utils.js';
function Dialog({ dismissible = true, ...props }) {
    return (_jsx(DialogPrimitive.Root, { "data-slot": "dialog", disablePointerDismissal: !dismissible, ...props }));
}
function DialogTrigger({ render, children, ...props }) {
    if (render) {
        return (_jsx(DialogPrimitive.Trigger, { "data-slot": "dialog-trigger", render: render, ...props, children: children }));
    }
    return (_jsx(DialogPrimitive.Trigger, { "data-slot": "dialog-trigger", ...props, children: children }));
}
function DialogPortal({ ...props }) {
    return _jsx(DialogPrimitive.Portal, { "data-slot": "dialog-portal", ...props });
}
function DialogClose({ ...props }) {
    return _jsx(DialogPrimitive.Close, { "data-slot": "dialog-close", ...props });
}
function DialogOverlay({ className, ...props }) {
    return (_jsx(DialogPrimitive.Backdrop, { "data-slot": "dialog-overlay", className: cn('data-closed:fade-out-0 data-open:fade-in-0 fixed inset-0 isolate z-50 bg-black/20 duration-100 data-closed:animate-out data-open:animate-in motion-reduce:duration-0 supports-backdrop-filter:backdrop-blur-xs dark:bg-black/40', className), ...props }));
}
function DialogContent({ className, children, showCloseButton = true, ...props }) {
    return (_jsxs(DialogPortal, { children: [_jsx(DialogOverlay, {}), _jsxs(DialogPrimitive.Popup, { "data-slot": "dialog-content", className: cn('data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg bg-background p-4 text-sm outline-none ring-1 ring-foreground/10 duration-100 data-closed:animate-out data-open:animate-in motion-reduce:duration-0 sm:max-w-sm overscroll-behavior-y-contain dark:ring-border', className), ...props, children: [children, showCloseButton && (_jsxs(DialogPrimitive.Close, { "data-slot": "dialog-close", className: "absolute top-2 right-2 inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground", children: [_jsx(XIcon, { size: 16 }), _jsx("span", { className: "sr-only", children: "Close" })] }))] })] }));
}
function DialogHeader({ className, ...props }) {
    return (_jsx("div", { "data-slot": "dialog-header", className: cn('flex flex-col gap-2', className), ...props }));
}
function DialogFooter({ className, children, ...props }) {
    return (_jsx("div", { "data-slot": "dialog-footer", className: cn('-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end dark:bg-muted/70', className), ...props, children: children }));
}
function DialogTitle({ className, ...props }) {
    return (_jsx(DialogPrimitive.Title, { "data-slot": "dialog-title", className: cn('font-semibold text-base leading-snug tracking-tight', className), ...props }));
}
function DialogDescription({ className, ...props }) {
    return (_jsx(DialogPrimitive.Description, { "data-slot": "dialog-description", className: cn('text-muted-foreground text-sm *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground', className), ...props }));
}
export { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger, };
