import type { ReactNode } from 'react';
export interface InspectorFieldProps {
    label: string;
    value: ReactNode;
    /** Optional smaller hint after the value, e.g. provider info. */
    hint?: ReactNode;
    className?: string;
}
export declare function InspectorField({ label, value, hint, className }: InspectorFieldProps): import("react/jsx-runtime").JSX.Element;
