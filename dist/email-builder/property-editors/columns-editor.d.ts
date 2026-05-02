import type { ColumnsBlockProps } from '../types.js';
interface Props {
    value: ColumnsBlockProps;
    onChange: (patch: Partial<ColumnsBlockProps>) => void;
}
export declare function ColumnsPropertyEditor({ value, onChange }: Props): import("react/jsx-runtime").JSX.Element;
export {};
