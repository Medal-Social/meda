import type { FooterBlockProps } from '../types.js';
interface Props {
    value: FooterBlockProps;
    onChange: (patch: Partial<FooterBlockProps>) => void;
}
export declare function FooterPropertyEditor({ value, onChange }: Props): import("react/jsx-runtime").JSX.Element;
export {};
