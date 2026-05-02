import type { SpacerBlockProps } from '../types.js';
interface Props {
    value: SpacerBlockProps;
    onChange: (patch: Partial<SpacerBlockProps>) => void;
}
export declare function SpacerPropertyEditor({ value, onChange }: Props): import("react/jsx-runtime").JSX.Element;
export {};
