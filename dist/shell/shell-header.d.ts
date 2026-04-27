import type { ReactNode } from 'react';
export interface WorkspaceSwitcherProps {
    workspaceMenuFooter?: ReactNode;
}
export declare function WorkspaceSwitcher({ workspaceMenuFooter }?: WorkspaceSwitcherProps): import("react/jsx-runtime").JSX.Element;
export declare function AppTabs(): import("react/jsx-runtime").JSX.Element;
export declare function PanelToggle(): import("react/jsx-runtime").JSX.Element;
export interface ShellHeaderProps {
    globalActions?: ReactNode;
    className?: string;
}
export declare function ShellHeader({ globalActions, className }?: ShellHeaderProps): import("react/jsx-runtime").JSX.Element | null;
