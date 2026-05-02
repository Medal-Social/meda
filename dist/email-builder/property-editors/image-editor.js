'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { cn } from '../../lib/utils.js';
import { AlignmentToggle, Field, NumberInput, SpacingEditor, TextInput } from './_shared.js';
export function ImagePropertyEditor({ value, onChange, renderMediaPicker }) {
    const [pickerOpen, setPickerOpen] = useState(false);
    return (_jsxs("div", { "data-slot": "email-builder-property-image", className: "flex flex-col gap-3", children: [_jsx(Field, { label: "Source URL", htmlFor: "img-src", children: _jsx(TextInput, { id: "img-src", value: value.src, onChange: (src) => onChange({ src }) }) }), renderMediaPicker ? (_jsx("button", { type: "button", onClick: () => setPickerOpen(true), className: cn('inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 font-medium text-sm', 'hover:bg-accent hover:text-accent-foreground'), children: "Pick from media library" })) : null, pickerOpen && renderMediaPicker
                ? renderMediaPicker({
                    onPick: (url) => {
                        onChange({ src: url });
                        setPickerOpen(false);
                    },
                    onCancel: () => setPickerOpen(false),
                })
                : null, _jsx(Field, { label: "Alt text", htmlFor: "img-alt", children: _jsx(TextInput, { id: "img-alt", value: value.alt, onChange: (alt) => onChange({ alt }) }) }), _jsx(Field, { label: "Link URL", htmlFor: "img-link", children: _jsx(TextInput, { id: "img-link", value: value.linkUrl, onChange: (linkUrl) => onChange({ linkUrl }) }) }), _jsx(Field, { label: "Width (px)", children: _jsx(NumberInput, { value: value.width, min: 20, max: 1200, onChange: (width) => onChange({ width }) }) }), _jsx(Field, { label: "Alignment", children: _jsx(AlignmentToggle, { value: value.alignment, onChange: (alignment) => onChange({ alignment }) }) }), _jsx(Field, { label: "Padding", children: _jsx(SpacingEditor, { value: value.padding, onChange: (padding) => onChange({ padding }) }) })] }));
}
