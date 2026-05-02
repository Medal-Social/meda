import { type ComponentProps } from 'react';
export type TextareaProps = ComponentProps<'textarea'>;
/**
 * Internal textarea used by post-preview platforms in editable mode.
 * Minimal styling — platform-specific previews layer on their own
 * background, font, and color via className. Not exported publicly.
 */
export declare const Textarea: import("react").ForwardRefExoticComponent<Omit<import("react").DetailedHTMLProps<import("react").TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>, "ref"> & import("react").RefAttributes<HTMLTextAreaElement>>;
