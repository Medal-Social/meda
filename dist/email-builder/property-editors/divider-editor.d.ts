import type { DividerBlockProps } from '../types.js';
interface Props {
    value: DividerBlockProps;
    onChange: (patch: Partial<DividerBlockProps>) => void;
}
export declare function DividerPropertyEditor({ value, onChange }: Props): import("react/jsx-runtime").JSX.Element;
export {};
