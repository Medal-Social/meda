import { type ReactNode } from 'react';
export declare const DEFAULT_SIDE_PANEL_WIDTH = 360;
export declare const MIN_SIDE_PANEL_WIDTH = 280;
export declare const MAX_SIDE_PANEL_WIDTH = 520;
export interface ShellSearchParamsAdapter {
    searchParams: URLSearchParams;
    setSearchParams: (updater: (currentSearchParams: URLSearchParams) => URLSearchParams) => void;
}
export interface ShellStateContextValue {
    activePanelView: string | null;
    lastPanelView: string | null;
    setActivePanelView: (view: string | null) => void;
    closePanelView: () => void;
    restoreLastPanelView: (fallbackView: string | null) => void;
    togglePanelView: (viewId: string) => void;
    sidePanelWidth: number;
    setSidePanelWidth: (width: number) => void;
    activeRail: string;
    setActiveRail: (rail: string) => void;
    selectedEntityId: string | null;
    selectEntity: (entityId: string, options?: {
        panelView?: string | null;
    }) => void;
    clearEntity: () => void;
    commandPaletteOpen: boolean;
    setCommandPaletteOpen: (open: boolean) => void;
    openCommandPalette: () => void;
    closeCommandPalette: () => void;
}
export declare function clampSidePanelWidth(width: number): number;
export declare function ShellStateProvider({ children, adapter, initialActiveRail, panelQueryParam, selectionQueryParam, sidePanelWidthStorageKey, }: {
    children: ReactNode;
    adapter: ShellSearchParamsAdapter;
    initialActiveRail?: string;
    panelQueryParam?: string;
    selectionQueryParam?: string;
    sidePanelWidthStorageKey?: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function useShellState(): ShellStateContextValue;
