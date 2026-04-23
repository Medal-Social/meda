import type { ReactNode } from 'react';
import type { ShellContentLayout } from './types.js';
export interface ShellScrollableContentProps {
    children: ReactNode;
    desktopDockOffset?: number;
    layout: ShellContentLayout;
    maxWidth?: number;
}
export declare function ShellScrollableContent({ children, desktopDockOffset, layout, maxWidth, }: ShellScrollableContentProps): import("react/jsx-runtime").JSX.Element;
