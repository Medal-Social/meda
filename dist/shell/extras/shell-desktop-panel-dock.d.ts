import * as React from 'react';
export declare function ShellDesktopPanelDock({ defaultView, panelOpen, viewIds, width, onWidthChange, renderPanel, className, }: {
    defaultView: string;
    panelOpen: boolean;
    viewIds?: string[];
    width: number;
    onWidthChange: (width: number) => void;
    renderPanel: (options: {
        defaultView: string;
        viewIds?: string[];
        className?: string;
    }) => React.ReactNode;
    className?: string;
}): import("react/jsx-runtime").JSX.Element;
