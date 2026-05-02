import type { ReactNode } from 'react';
import type { TextBlockProps } from '../types.js';
interface Props {
    value: TextBlockProps;
    onChange: (patch: Partial<TextBlockProps>) => void;
    /** Optional rich-text editor slot (Lexical, etc.). Defaults to a textarea. */
    renderEditor?: (ctx: {
        value: string;
        onChange: (next: string) => void;
    }) => ReactNode;
}
export declare function TextPropertyEditor({ value, onChange, renderEditor }: Props): import("react/jsx-runtime").JSX.Element;
export {};
