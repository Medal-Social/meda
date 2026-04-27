import type { ReactNode } from 'react';
export declare function ShellHeaderFrame({ left, center, right, className, }: {
    left: ReactNode;
    center?: ReactNode;
    right?: ReactNode;
    className?: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function ShellPanelToggle({ panelOpen, onToggle, }: {
    panelOpen: boolean;
    onToggle: () => void;
}): import("react/jsx-runtime").JSX.Element;
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
export declare function ShellHeader({ globalActions, className }?: ShellHeaderProps): import("react/jsx-runtime").JSX.Element;
