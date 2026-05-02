'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cloneElement, isValidElement } from 'react';
import { cn } from '../../lib/utils.js';
/**
 * Wraps a labeled control. If `htmlFor` is set, the label uses it. Otherwise
 * the field auto-injects `aria-label` on the immediate child element so axe
 * passes without the consumer manually wiring ids everywhere.
 */
export function Field({ label, htmlFor, children, }) {
    const enhanced = !htmlFor && isValidElement(children)
        ? cloneElement(children, {
            'aria-label': label,
        })
        : children;
    return (_jsxs("div", { "data-slot": "email-builder-field", className: "flex flex-col gap-1.5", children: [_jsx("label", { htmlFor: htmlFor, className: "font-medium text-foreground text-xs", children: label }), enhanced] }));
}
export function TextInput({ id, value, onChange, placeholder, 'aria-label': ariaLabel, }) {
    return (_jsx("input", { id: id, type: "text", value: value, placeholder: placeholder, "aria-label": ariaLabel, onChange: (e) => onChange(e.target.value), className: "w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" }));
}
export function TextAreaInput({ id, value, onChange, rows = 4, 'aria-label': ariaLabel, }) {
    return (_jsx("textarea", { id: id, value: value, rows: rows, "aria-label": ariaLabel, onChange: (e) => onChange(e.target.value), className: "w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" }));
}
export function NumberInput({ id, value, onChange, min, max, step = 1, 'aria-label': ariaLabel, }) {
    return (_jsx("input", { id: id, type: "number", value: value, min: min, max: max, step: step, "aria-label": ariaLabel, onChange: (e) => {
            const n = Number(e.target.value);
            if (!Number.isNaN(n))
                onChange(n);
        }, className: "w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" }));
}
export function ColorInput({ id, value, onChange, }) {
    return (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { id: id, type: "color", value: value || '#000000', onChange: (e) => onChange(e.target.value), className: "h-8 w-10 cursor-pointer rounded border border-input bg-transparent", "aria-label": "Color picker" }), _jsx("input", { type: "text", value: value, "aria-label": "Color value (hex)", onChange: (e) => onChange(e.target.value), className: "w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" })] }));
}
export function SelectInput({ id, value, options, onChange, 'aria-label': ariaLabel, }) {
    return (_jsx("select", { id: id, value: value, "aria-label": ariaLabel, onChange: (e) => onChange(e.target.value), className: "w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring", children: options.map((opt) => (_jsx("option", { value: opt.value, children: opt.label }, opt.value))) }));
}
export function AlignmentToggle({ value, onChange, }) {
    const options = ['left', 'center', 'right'];
    return (_jsx("div", { role: "radiogroup", "aria-label": "Alignment", className: "inline-flex rounded-md border border-input p-0.5", children: options.map((opt) => (_jsx("button", { type: "button", role: "radio", "aria-checked": value === opt, onClick: () => onChange(opt), className: cn('rounded px-3 py-1.5 text-xs capitalize', value === opt
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent'), children: opt }, opt))) }));
}
export function SpacingEditor({ value, onChange, }) {
    return (_jsx("div", { className: "grid grid-cols-2 gap-2", children: ['top', 'right', 'bottom', 'left'].map((side) => {
            const label = (side[0]?.toUpperCase() + side.slice(1));
            return (_jsxs("div", { "data-slot": "email-builder-field", className: "flex flex-col gap-1.5", children: [_jsx("span", { className: "font-medium text-foreground text-xs", children: label }), _jsx("input", { type: "number", value: value[side], min: 0, "aria-label": `${label} padding`, onChange: (e) => {
                            const n = Number(e.target.value);
                            if (!Number.isNaN(n))
                                onChange({ ...value, [side]: n });
                        }, className: "w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" })] }, side));
        }) }));
}
