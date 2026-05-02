'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ColorInput, Field, NumberInput, SelectInput, SpacingEditor } from './_shared.js';
export function DividerPropertyEditor({ value, onChange }) {
    return (_jsxs("div", { "data-slot": "email-builder-property-divider", className: "flex flex-col gap-3", children: [_jsx(Field, { label: "Color", children: _jsx(ColorInput, { value: value.color, onChange: (color) => onChange({ color }) }) }), _jsx(Field, { label: "Thickness (px)", children: _jsx(NumberInput, { value: value.thickness, min: 1, max: 20, onChange: (thickness) => onChange({ thickness }) }) }), _jsx(Field, { label: "Width (%)", children: _jsx(NumberInput, { value: value.width, min: 1, max: 100, onChange: (width) => onChange({ width }) }) }), _jsx(Field, { label: "Style", children: _jsx(SelectInput, { value: value.style, options: [
                        { value: 'solid', label: 'Solid' },
                        { value: 'dashed', label: 'Dashed' },
                        { value: 'dotted', label: 'Dotted' },
                    ], onChange: (style) => onChange({ style }) }) }), _jsx(Field, { label: "Padding", children: _jsx(SpacingEditor, { value: value.padding, onChange: (padding) => onChange({ padding }) }) })] }));
}
