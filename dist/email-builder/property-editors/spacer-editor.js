'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { Field, NumberInput } from './_shared.js';
export function SpacerPropertyEditor({ value, onChange }) {
    return (_jsx("div", { "data-slot": "email-builder-property-spacer", className: "flex flex-col gap-3", children: _jsx(Field, { label: "Height (px)", children: _jsx(NumberInput, { value: value.height, min: 1, max: 400, onChange: (height) => onChange({ height }) }) }) }));
}
