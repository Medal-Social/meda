import type { HeadingBlockProps } from '../types.js';
interface Props {
    value: HeadingBlockProps;
    onChange: (patch: Partial<HeadingBlockProps>) => void;
}
export declare function HeadingPropertyEditor({ value, onChange }: Props): import("react/jsx-runtime").JSX.Element;
export {};
