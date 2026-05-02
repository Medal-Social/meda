'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils.js';
import { AlignmentToggle, Field, NumberInput, SpacingEditor, TextInput } from './_shared.js';
export function SocialPropertyEditor({ value, onChange }) {
    const updateLink = (index, patch) => {
        const links = value.links.map((l, i) => (i === index ? { ...l, ...patch } : l));
        onChange({ links });
    };
    const removeLink = (index) => {
        onChange({ links: value.links.filter((_, i) => i !== index) });
    };
    const addLink = () => {
        onChange({ links: [...value.links, { platform: 'twitter', url: 'https://' }] });
    };
    return (_jsxs("div", { "data-slot": "email-builder-property-social", className: "flex flex-col gap-3", children: [_jsx(Field, { label: "Links", children: _jsxs("div", { className: "flex flex-col gap-2", children: [value.links.map((link, i) => (_jsxs("div", { className: "flex flex-col gap-1.5 rounded-md border border-input p-2", children: [_jsx(TextInput, { value: link.platform, placeholder: "Platform", onChange: (platform) => updateLink(i, { platform }) }), _jsx(TextInput, { value: link.url, placeholder: "https://", onChange: (url) => updateLink(i, { url }) }), _jsx(TextInput, { value: link.iconUrl ?? '', placeholder: "Icon URL (optional)", onChange: (iconUrl) => updateLink(i, { iconUrl }) }), _jsxs("button", { type: "button", onClick: () => removeLink(i), className: cn('inline-flex h-8 items-center justify-center gap-1 rounded-md text-destructive text-xs hover:bg-destructive/10'), "aria-label": "Remove link", children: [_jsx(Trash2, { className: "size-3.5" }), " Remove"] })] }, i))), _jsxs("button", { type: "button", onClick: addLink, className: "inline-flex h-9 items-center justify-center gap-1 rounded-md border border-input border-dashed text-sm hover:bg-accent", children: [_jsx(Plus, { className: "size-4" }), " Add link"] })] }) }), _jsx(Field, { label: "Icon size (px)", children: _jsx(NumberInput, { value: value.iconSize, min: 12, max: 64, onChange: (iconSize) => onChange({ iconSize }) }) }), _jsx(Field, { label: "Spacing (px)", children: _jsx(NumberInput, { value: value.spacing, min: 0, max: 48, onChange: (spacing) => onChange({ spacing }) }) }), _jsx(Field, { label: "Alignment", children: _jsx(AlignmentToggle, { value: value.alignment, onChange: (alignment) => onChange({ alignment }) }) }), _jsx(Field, { label: "Padding", children: _jsx(SpacingEditor, { value: value.padding, onChange: (padding) => onChange({ padding }) }) })] }));
}
