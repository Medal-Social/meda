'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ColorInput, Field, NumberInput, SelectInput, SpacingEditor } from './_shared.js';
export function ColumnsPropertyEditor({ value, onChange }) {
    return (_jsxs("div", { "data-slot": "email-builder-property-columns", className: "flex flex-col gap-3", children: [_jsx(Field, { label: "Layout", children: _jsx(SelectInput, { value: value.layout, options: [
                        { value: '50-50', label: '2 columns (50/50)' },
                        { value: '33-67', label: '2 columns (33/67)' },
                        { value: '67-33', label: '2 columns (67/33)' },
                        { value: '33-33-33', label: '3 columns' },
                    ], onChange: (layout) => onChange({ layout }) }) }), _jsx(Field, { label: "Vertical alignment", children: _jsx(SelectInput, { value: value.verticalAlignment, options: [
                        { value: 'top', label: 'Top' },
                        { value: 'middle', label: 'Middle' },
                        { value: 'bottom', label: 'Bottom' },
                    ], onChange: (verticalAlignment) => onChange({ verticalAlignment }) }) }), _jsx(Field, { label: "Background color", children: _jsx(ColorInput, { value: value.backgroundColor === 'transparent' ? '#ffffff' : value.backgroundColor, onChange: (backgroundColor) => onChange({ backgroundColor }) }) }), _jsx(Field, { label: "Gap (px)", children: _jsx(NumberInput, { value: value.gap, min: 0, max: 64, onChange: (gap) => onChange({ gap }) }) }), _jsx(Field, { label: "Mobile stacking", children: _jsxs("label", { className: "inline-flex items-center gap-2 text-sm", children: [_jsx("input", { type: "checkbox", checked: value.mobileStacking, onChange: (e) => onChange({ mobileStacking: e.target.checked }) }), "Stack columns vertically on mobile"] }) }), _jsx(Field, { label: "Padding", children: _jsx(SpacingEditor, { value: value.padding, onChange: (padding) => onChange({ padding }) }) })] }));
}
