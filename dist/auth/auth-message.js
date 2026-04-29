'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '../lib/utils.js';
export function AuthError({ children, className, ...props }) {
    if (!children) {
        return null;
    }
    return (_jsx("div", { role: "alert", className: cn('rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive', className), ...props, children: children }));
}
export function AuthNotice({ children, className, ...props }) {
    if (!children) {
        return null;
    }
    return (_jsx("div", { className: cn('rounded-md border border-border bg-muted/60 px-3 py-2 text-sm text-muted-foreground', className), ...props, children: children }));
}
export function AuthOneTapSlot({ children, className, ...props }) {
    return (_jsx("div", { "data-meda-auth-one-tap-slot": "", className: cn('contents', className), ...props, children: children }));
}
