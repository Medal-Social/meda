import { type ReactNode } from 'react';
import { type ShellStorageAdapter } from './layout-state.js';
import type { AppDefinition, MobileBottomNavItem, PanelMode, ThemeAdapter, WorkspaceDefinition } from './types.js';
export type MobileDrawerKind = 'menu-drawer' | 'module-drawer' | 'panels-drawer' | 'ai-drawer' | (string & {}) | null;
interface MedaShellContextValue {
    workspace: WorkspaceDefinition;
    workspaces: WorkspaceDefinition[];
    apps: AppDefinition[];
    activeAppId: string;
    setActiveApp: (id: string) => void;
    panel: {
        mode: PanelMode;
        activeView: string | null;
        width: number;
        setMode: (m: PanelMode) => void;
        setActiveView: (v: string | null) => void;
        setWidth: (w: number) => void;
        /** Opens panel + switches to viewId in one call.
         * Sugar for app keyboard shortcuts (e.g. Cmd+J → panel.focus('ai')).
         * If already open in 'panel', 'expanded', or 'fullscreen', the existing
         * mode is preserved — only flips closed → panel. */
        focus: (viewId: string) => void;
    };
    contextRail: {
        width: number;
        collapsed: boolean;
        setWidth: (w: number) => void;
        setCollapsed: (c: boolean) => void;
    };
    mobileBottomNav: MobileBottomNavItem[];
    mobileDrawer: {
        open: MobileDrawerKind;
        setOpen: (kind: MobileDrawerKind) => void;
    };
    commandPalette: {
        open: boolean;
        setOpen: (open: boolean) => void;
    };
    commandPaletteHotkey: string;
    /** Selection bridge between main workspace and right panel views (spec §17). */
    selection: unknown | null;
    setSelection: (value: unknown | null) => void;
}
export declare function useMedaShell(): MedaShellContextValue;
/**
 * Selection bridge between main workspace and right panel views (spec §17).
 *
 * `T` is consumer-typed: setSelection writes whatever shape you pass; the
 * matching getter narrows to `T | null`. The shell does not validate the
 * shape — coordinate types between writer and readers in your app.
 */
export declare function useShellSelection<T>(): readonly [T | null, (value: T | null) => void];
export interface MedaShellProviderProps {
    workspace: WorkspaceDefinition;
    workspaces?: WorkspaceDefinition[];
    apps: AppDefinition[];
    defaultActiveApp?: string;
    storage?: ShellStorageAdapter;
    mobileBottomNav?: MobileBottomNavItem[];
    commandPaletteHotkey?: string;
    themeAdapter?: 'default' | 'next-themes' | ThemeAdapter;
    children: ReactNode;
}
export declare function MedaShellProvider(props: MedaShellProviderProps): import("react/jsx-runtime").JSX.Element;
export {};
