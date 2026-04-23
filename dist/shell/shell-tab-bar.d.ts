import type { ReactNode } from 'react';
import type { ShellTab } from './types.js';
interface ShellTabBarRenderArgs {
    children: ReactNode;
    className: string;
    isActive: boolean;
    tab: ShellTab;
}
export interface ShellTabBarProps {
    tabs: ShellTab[];
    activeTab?: string;
    onTabChange?: (tabId: string) => void;
    className?: string;
    ariaLabel?: string;
    renderLink?: (args: ShellTabBarRenderArgs) => ReactNode;
}
export declare function ShellTabBar({ tabs, activeTab, onTabChange, className, ariaLabel, renderLink, }: ShellTabBarProps): import("react/jsx-runtime").JSX.Element | null;
export {};
