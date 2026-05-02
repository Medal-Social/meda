'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ButtonPropertyEditor } from './property-editors/button-editor.js';
import { ColumnsPropertyEditor } from './property-editors/columns-editor.js';
import { DividerPropertyEditor } from './property-editors/divider-editor.js';
import { FooterPropertyEditor } from './property-editors/footer-editor.js';
import { HeadingPropertyEditor } from './property-editors/heading-editor.js';
import { ImagePropertyEditor } from './property-editors/image-editor.js';
import { SocialPropertyEditor } from './property-editors/social-editor.js';
import { SpacerPropertyEditor } from './property-editors/spacer-editor.js';
import { TextPropertyEditor } from './property-editors/text-editor.js';
export function PropertyInspector({ block, onChange, emptyContent, renderMediaPicker, renderTextEditor, }) {
    if (!block) {
        return (_jsx("div", { "data-slot": "email-builder-inspector-empty", className: "flex h-full items-center justify-center p-6 text-center text-muted-foreground text-sm", children: emptyContent }));
    }
    return (_jsxs("div", { "data-slot": "email-builder-inspector", className: "flex flex-col gap-3 p-4", children: [_jsxs("div", { className: "font-semibold text-foreground text-sm capitalize", children: [block.kind, " properties"] }), renderEditor(block, onChange, { renderMediaPicker, renderTextEditor })] }));
}
function renderEditor(block, onChange, slots) {
    const id = block.id;
    switch (block.kind) {
        case 'heading':
            return (_jsx(HeadingPropertyEditor, { value: block.props, onChange: (p) => onChange(id, p) }));
        case 'text':
            return (_jsx(TextPropertyEditor, { value: block.props, onChange: (p) => onChange(id, p), renderEditor: slots.renderTextEditor }));
        case 'image':
            return (_jsx(ImagePropertyEditor, { value: block.props, onChange: (p) => onChange(id, p), renderMediaPicker: slots.renderMediaPicker }));
        case 'button':
            return (_jsx(ButtonPropertyEditor, { value: block.props, onChange: (p) => onChange(id, p) }));
        case 'divider':
            return (_jsx(DividerPropertyEditor, { value: block.props, onChange: (p) => onChange(id, p) }));
        case 'spacer':
            return (_jsx(SpacerPropertyEditor, { value: block.props, onChange: (p) => onChange(id, p) }));
        case 'columns':
            return (_jsx(ColumnsPropertyEditor, { value: block.props, onChange: (p) => onChange(id, p) }));
        case 'social':
            return (_jsx(SocialPropertyEditor, { value: block.props, onChange: (p) => onChange(id, p) }));
        case 'footer':
            return (_jsx(FooterPropertyEditor, { value: block.props, onChange: (p) => onChange(id, p) }));
        default:
            return null;
    }
}
