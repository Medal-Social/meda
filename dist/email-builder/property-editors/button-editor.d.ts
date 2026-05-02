import type { ButtonBlockProps } from '../types.js';
interface Props {
    value: ButtonBlockProps;
    onChange: (patch: Partial<ButtonBlockProps>) => void;
}
export declare function ButtonPropertyEditor({ value, onChange }: Props): import("react/jsx-runtime").JSX.Element;
export {};
