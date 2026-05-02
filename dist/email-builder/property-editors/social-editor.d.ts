import type { SocialBlockProps } from '../types.js';
interface Props {
    value: SocialBlockProps;
    onChange: (patch: Partial<SocialBlockProps>) => void;
}
export declare function SocialPropertyEditor({ value, onChange }: Props): import("react/jsx-runtime").JSX.Element;
export {};
