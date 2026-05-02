import type { ReactNode } from 'react';
import type { Alignment, SpacingValue } from '../types.js';
/**
 * Wraps a labeled control. If `htmlFor` is set, the label uses it. Otherwise
 * the field auto-injects `aria-label` on the immediate child element so axe
 * passes without the consumer manually wiring ids everywhere.
 */
export declare function Field({ label, htmlFor, children, }: {
    label: string;
    htmlFor?: string;
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function TextInput({ id, value, onChange, placeholder, 'aria-label': ariaLabel, }: {
    id?: string;
    value: string;
    onChange: (next: string) => void;
    placeholder?: string;
    'aria-label'?: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function TextAreaInput({ id, value, onChange, rows, 'aria-label': ariaLabel, }: {
    id?: string;
    value: string;
    onChange: (next: string) => void;
    rows?: number;
    'aria-label'?: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function NumberInput({ id, value, onChange, min, max, step, 'aria-label': ariaLabel, }: {
    id?: string;
    value: number;
    onChange: (next: number) => void;
    min?: number;
    max?: number;
    step?: number;
    'aria-label'?: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function ColorInput({ id, value, onChange, }: {
    id?: string;
    value: string;
    onChange: (next: string) => void;
}): import("react/jsx-runtime").JSX.Element;
export declare function SelectInput<T extends string>({ id, value, options, onChange, 'aria-label': ariaLabel, }: {
    id?: string;
    value: T;
    options: {
        value: T;
        label: string;
    }[];
    onChange: (next: T) => void;
    'aria-label'?: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function AlignmentToggle({ value, onChange, }: {
    value: Alignment;
    onChange: (next: Alignment) => void;
}): import("react/jsx-runtime").JSX.Element;
export declare function SpacingEditor({ value, onChange, }: {
    value: SpacingValue;
    onChange: (next: SpacingValue) => void;
}): import("react/jsx-runtime").JSX.Element;
