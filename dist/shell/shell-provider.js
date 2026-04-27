'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { LayoutGrid, Menu, PanelTop, Sparkles } from 'lucide-react';
import { createContext, lazy, Suspense, useContext, useMemo, useState, } from 'react';
import { createLocalStorageAdapter, useShellLayoutState, } from './layout-state.js';
import { DefaultThemeProvider, ThemeCtx } from './theme.js';
// ---------------------------------------------------------------------------
// Theme adapter wiring
// ---------------------------------------------------------------------------
// Lazy-loaded so that importing next-themes only happens when the consumer
// passes themeAdapter='next-themes'. Default-adapter consumers never trigger
// the import.
const NextThemesAdapter = lazy(() => import('./theme-next-themes.js').then((m) => ({ default: m.NextThemesAdapter })));
function CustomThemeBridge({ adapter, children }) {
    return _jsx(ThemeCtx.Provider, { value: adapter, children: children });
}
function pickTheme(themeAdapter, children) {
    const adapter = themeAdapter ?? 'default';
    if (adapter === 'default') {
        return _jsx(DefaultThemeProvider, { children: children });
    }
    if (adapter === 'next-themes') {
        return (_jsx(Suspense, { fallback: null, children: _jsx(NextThemesAdapter, { children: children }) }));
    }
    // Custom ThemeAdapter object
    return _jsx(CustomThemeBridge, { adapter: adapter, children: children });
}
// ---------------------------------------------------------------------------
// Default mobile bottom nav (canonical 4-item set, per spec §16)
// Full icons ship here; the per-app customisation point is the mobileBottomNav
// prop. For RC.1 the canonical drawer wire-up is a Phase 13 concern — only
// the shape is locked here.
// ---------------------------------------------------------------------------
const defaultMobileBottomNav = [
    { id: 'menu', label: 'Menu', icon: Menu, opens: 'menu-drawer' },
    { id: 'module', label: 'Module', icon: LayoutGrid, opens: 'module-drawer' },
    { id: 'panels', label: 'Panels', icon: PanelTop, opens: 'panels-drawer' },
    { id: 'ai', label: 'AI', icon: Sparkles, opens: 'ai-drawer' },
];
const Ctx = createContext(null);
export function useMedaShell() {
    const v = useContext(Ctx);
    if (!v)
        throw new Error('useMedaShell must be used inside <MedaShellProvider>');
    return v;
}
/**
 * Selection bridge between main workspace and right panel views (spec §17).
 *
 * `T` is consumer-typed: setSelection writes whatever shape you pass; the
 * matching getter narrows to `T | null`. The shell does not validate the
 * shape — coordinate types between writer and readers in your app.
 */
export function useShellSelection() {
    const ctx = useMedaShell();
    return [ctx.selection, ctx.setSelection];
}
// ---------------------------------------------------------------------------
// Provider implementation
// ---------------------------------------------------------------------------
export function MedaShellProvider(props) {
    // Guard: apps array must not be empty
    if (props.apps.length === 0) {
        throw new Error('MedaShellProvider: apps must contain at least one AppDefinition');
    }
    // Stable storage reference — prevents useShellLayoutState's hydration
    // effect from looping when an inline adapter would change identity each render.
    const storage = useMemo(() => props.storage ?? createLocalStorageAdapter(), [props.storage]);
    const [activeAppId, setActiveApp] = useState(props.defaultActiveApp ?? props.apps[0]?.id ?? '');
    const [selection, setSelection] = useState(null);
    const [layoutState, setLayoutState] = useShellLayoutState({
        workspaceId: props.workspace.id,
        appId: activeAppId,
        storage,
    });
    // NOTE: The narrower setters read the closure-captured `layoutState`.
    // Calling two setters in the same tick means only the last write wins.
    // This is acceptable for RC.1; add updater-form support to
    // useShellLayoutState as a follow-up if needed.
    const panel = useMemo(() => ({
        mode: layoutState.rightPanel.mode,
        activeView: layoutState.rightPanel.activeView,
        setMode: (mode) => setLayoutState({
            ...layoutState,
            rightPanel: { ...layoutState.rightPanel, mode },
        }),
        setActiveView: (activeView) => setLayoutState({
            ...layoutState,
            rightPanel: { ...layoutState.rightPanel, activeView },
        }),
    }), [layoutState, setLayoutState]);
    const contextRail = useMemo(() => ({
        width: layoutState.contextRail.width,
        collapsed: layoutState.contextRail.collapsed,
        setWidth: (width) => setLayoutState({
            ...layoutState,
            contextRail: { ...layoutState.contextRail, width },
        }),
        setCollapsed: (collapsed) => setLayoutState({
            ...layoutState,
            contextRail: { ...layoutState.contextRail, collapsed },
        }),
    }), [layoutState, setLayoutState]);
    const value = useMemo(() => ({
        workspace: props.workspace,
        workspaces: props.workspaces ?? [props.workspace],
        apps: props.apps,
        activeAppId,
        setActiveApp,
        panel,
        contextRail,
        mobileBottomNav: props.mobileBottomNav ?? defaultMobileBottomNav,
        commandPaletteHotkey: props.commandPaletteHotkey ?? 'mod+k',
        selection,
        setSelection,
    }), [
        props.workspace,
        props.workspaces,
        props.apps,
        activeAppId,
        panel,
        contextRail,
        props.mobileBottomNav,
        props.commandPaletteHotkey,
        selection,
    ]);
    return _jsx(Ctx.Provider, { value: value, children: pickTheme(props.themeAdapter, props.children) });
}
