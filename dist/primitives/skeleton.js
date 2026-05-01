'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '../lib/utils.js';
export function Skeleton({ className, 'aria-hidden': ariaHidden = true, ...props }) {
    return (_jsx("div", { "data-slot": "skeleton", "aria-hidden": ariaHidden, className: cn('animate-pulse rounded-md bg-muted', className), ...props }));
}
