import type { ReactNode } from 'react';
import type { ShellMainLayout } from './types.js';
export interface ShellMainProps {
    layout?: ShellMainLayout;
    className?: string;
    children: ReactNode;
}
export declare function ShellMain({ layout, className, children }: ShellMainProps): import("react/jsx-runtime").JSX.Element;
