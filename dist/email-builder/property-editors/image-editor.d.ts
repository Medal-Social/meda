import type { EmailBuilderProps, ImageBlockProps } from '../types.js';
interface Props {
    value: ImageBlockProps;
    onChange: (patch: Partial<ImageBlockProps>) => void;
    renderMediaPicker?: EmailBuilderProps['renderMediaPicker'];
}
export declare function ImagePropertyEditor({ value, onChange, renderMediaPicker }: Props): import("react/jsx-runtime").JSX.Element;
export {};
