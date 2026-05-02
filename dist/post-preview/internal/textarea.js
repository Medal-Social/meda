'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { cn } from '../../lib/utils.js';
/**
 * Internal textarea used by post-preview platforms in editable mode.
 * Minimal styling — platform-specific previews layer on their own
 * background, font, and color via className. Not exported publicly.
 */
export const Textarea = forwardRef(function Textarea({ className, ...props }, ref) {
    return (_jsx("textarea", { ref: ref, "data-slot": "post-preview-textarea", className: cn('block w-full resize-none border-0 bg-transparent p-0 outline-none', 'placeholder:text-muted-foreground/60', 'focus-visible:ring-0 focus-visible:ring-offset-0', className), ...props }));
});
