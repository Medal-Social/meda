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
