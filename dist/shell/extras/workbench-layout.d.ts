import type { ReactNode } from 'react';
import type { ShellViewportBand } from './types.js';
export interface WorkbenchLayoutProps {
    viewportBand: ShellViewportBand;
    main: ReactNode;
    aside?: ReactNode;
    toolbar?: ReactNode;
    className?: string;
}
export declare function WorkbenchLayout({ viewportBand, main, aside, toolbar, className, }: WorkbenchLayoutProps): import("react/jsx-runtime").JSX.Element;
