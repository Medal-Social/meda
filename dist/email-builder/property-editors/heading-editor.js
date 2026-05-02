'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { EMAIL_FONT_OPTIONS } from '../internal/email-font-options.js';
import { AlignmentToggle, ColorInput, Field, NumberInput, SelectInput, SpacingEditor, TextInput, } from './_shared.js';
export function HeadingPropertyEditor({ value, onChange }) {
    return (_jsxs("div", { "data-slot": "email-builder-property-heading", className: "flex flex-col gap-3", children: [_jsx(Field, { label: "Text", htmlFor: "heading-text", children: _jsx(TextInput, { id: "heading-text", value: value.text, onChange: (text) => onChange({ text }) }) }), _jsx(Field, { label: "Level", htmlFor: "heading-level", children: _jsx(SelectInput, { id: "heading-level", value: String(value.level), options: [
                        { value: '1', label: 'H1' },
                        { value: '2', label: 'H2' },
                        { value: '3', label: 'H3' },
                    ], onChange: (v) => onChange({ level: Number(v) }) }) }), _jsx(Field, { label: "Alignment", children: _jsx(AlignmentToggle, { value: value.alignment, onChange: (alignment) => onChange({ alignment }) }) }), _jsx(Field, { label: "Color", htmlFor: "heading-color", children: _jsx(ColorInput, { id: "heading-color", value: value.color, onChange: (color) => onChange({ color }) }) }), _jsx(Field, { label: "Font family", htmlFor: "heading-font", children: _jsx(SelectInput, { id: "heading-font", value: value.fontFamily, options: EMAIL_FONT_OPTIONS.map((o) => ({ value: o.value, label: o.label })), onChange: (fontFamily) => onChange({ fontFamily }) }) }), _jsx(Field, { label: "Font weight", children: _jsx(SelectInput, { value: String(value.fontWeight), options: [
                        { value: '400', label: 'Regular' },
                        { value: '500', label: 'Medium' },
                        { value: '600', label: 'Semibold' },
                        { value: '700', label: 'Bold' },
                    ], onChange: (v) => onChange({ fontWeight: Number(v) }) }) }), _jsx(Field, { label: "Font size (px)", htmlFor: "heading-fs", children: _jsx(NumberInput, { id: "heading-fs", value: value.fontSize, min: 10, max: 96, onChange: (fontSize) => onChange({ fontSize }) }) }), _jsx(Field, { label: "Padding", children: _jsx(SpacingEditor, { value: value.padding, onChange: (padding) => onChange({ padding }) }) })] }));
}
