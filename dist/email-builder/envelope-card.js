'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId } from 'react';
const fieldClass = 'w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring';
export function EnvelopeCard({ envelope, onChange }) {
    const e = envelope ?? {};
    const update = (patch) => onChange({ ...e, ...patch });
    const ids = {
        subject: useId(),
        fromName: useId(),
        fromEmail: useId(),
        replyTo: useId(),
        preheader: useId(),
    };
    return (_jsxs("div", { "data-slot": "email-builder-envelope", className: "flex flex-col gap-2 p-3", children: [_jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("label", { htmlFor: ids.subject, className: "font-medium text-foreground text-xs", children: "Subject" }), _jsx("input", { id: ids.subject, type: "text", value: e.subject ?? '', onChange: (ev) => update({ subject: ev.target.value }), className: fieldClass })] }), _jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("label", { htmlFor: ids.fromName, className: "font-medium text-foreground text-xs", children: "From name" }), _jsx("input", { id: ids.fromName, type: "text", value: e.fromName ?? '', onChange: (ev) => update({ fromName: ev.target.value }), className: fieldClass })] }), _jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("label", { htmlFor: ids.fromEmail, className: "font-medium text-foreground text-xs", children: "From email" }), _jsx("input", { id: ids.fromEmail, type: "email", value: e.fromEmail ?? '', onChange: (ev) => update({ fromEmail: ev.target.value }), className: fieldClass })] }), _jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("label", { htmlFor: ids.replyTo, className: "font-medium text-foreground text-xs", children: "Reply-to" }), _jsx("input", { id: ids.replyTo, type: "email", value: e.replyTo ?? '', onChange: (ev) => update({ replyTo: ev.target.value }), className: fieldClass })] }), _jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("label", { htmlFor: ids.preheader, className: "font-medium text-foreground text-xs", children: "Preheader" }), _jsx("input", { id: ids.preheader, type: "text", value: e.preheader ?? '', onChange: (ev) => update({ preheader: ev.target.value }), className: fieldClass })] })] }));
}
