'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox';
import { CheckIcon, MinusIcon } from 'lucide-react';
import { cn } from '../../lib/utils.js';
function Checkbox({ className, indeterminate, ...props }) {
    return (_jsx(CheckboxPrimitive.Root, { "data-slot": "checkbox", className: cn('peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input outline-none transition-colors after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 group-has-disabled/field:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:bg-input/30 dark:data-checked:bg-primary dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40', indeterminate && 'border-primary bg-primary text-primary-foreground', className), ...props, children: indeterminate ? (_jsx("span", { className: "grid place-content-center text-current [&>svg]:size-3.5", children: _jsx(MinusIcon, {}) })) : (_jsx(CheckboxPrimitive.Indicator, { "data-slot": "checkbox-indicator", className: "grid place-content-center text-current transition-none [&>svg]:size-3.5", children: _jsx(CheckIcon, {}) })) }));
}
export { Checkbox };
