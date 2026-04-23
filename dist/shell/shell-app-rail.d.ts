import type { ReactNode } from 'react';
import type { ShellRailItem } from './types.js';
interface ShellAppRailRenderArgs {
    children: ReactNode;
    className: string;
    isActive: boolean;
    item: ShellRailItem;
}
export interface ShellAppRailProps {
    mainItems: ShellRailItem[];
    utilityItems: ShellRailItem[];
    className?: string;
    footer?: ReactNode;
    isItemActive: (item: ShellRailItem) => boolean;
    renderLink: (args: ShellAppRailRenderArgs) => ReactNode;
}
export declare function ShellAppRail({ mainItems, utilityItems, className, footer, isItemActive, renderLink, }: ShellAppRailProps): import("react/jsx-runtime").JSX.Element;
export {};
