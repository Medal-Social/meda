import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useMemo, useRef, useState, } from 'react';
export const DEFAULT_SIDE_PANEL_WIDTH = 360;
export const MIN_SIDE_PANEL_WIDTH = 280;
export const MAX_SIDE_PANEL_WIDTH = 520;
const ShellStateContext = createContext(null);
export function clampSidePanelWidth(width) {
    return Math.min(MAX_SIDE_PANEL_WIDTH, Math.max(MIN_SIDE_PANEL_WIDTH, width));
}
function readStoredSidePanelWidth(storageKey) {
    if (typeof window === 'undefined')
        return DEFAULT_SIDE_PANEL_WIDTH;
    const storedValue = typeof window.localStorage?.getItem === 'function'
        ? window.localStorage.getItem(storageKey)
        : null;
    const stored = Number(storedValue);
    return Number.isFinite(stored) && stored > 0
        ? clampSidePanelWidth(stored)
        : DEFAULT_SIDE_PANEL_WIDTH;
}
export function ShellStateProvider({ children, adapter, initialActiveRail = 'home', panelQueryParam = 'panel', selectionQueryParam = 'selection', sidePanelWidthStorageKey = 'meda.side-panel.width', }) {
    const { searchParams, setSearchParams } = adapter;
    const [sidePanelWidthState, setSidePanelWidthState] = useState(() => readStoredSidePanelWidth(sidePanelWidthStorageKey));
    const [activeRail, setActiveRail] = useState(initialActiveRail);
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
    const lastPanelViewRef = useRef(null);
    const persistTimerRef = useRef(undefined);
    const activePanelView = searchParams.get(panelQueryParam);
    const selectedEntityId = searchParams.get(selectionQueryParam);
    useEffect(() => {
        if (activePanelView) {
            lastPanelViewRef.current = activePanelView;
        }
    }, [activePanelView]);
    useEffect(() => {
        return () => {
            clearTimeout(persistTimerRef.current);
        };
    }, []);
    function updateSearchParams(mutate) {
        setSearchParams((currentSearchParams) => {
            const nextSearchParams = new URLSearchParams(currentSearchParams);
            mutate(nextSearchParams);
            return nextSearchParams;
        });
    }
    function setActivePanelView(view) {
        if (view) {
            lastPanelViewRef.current = view;
        }
        updateSearchParams((nextSearchParams) => {
            if (view) {
                nextSearchParams.set(panelQueryParam, view);
            }
            else {
                nextSearchParams.delete(panelQueryParam);
            }
        });
    }
    function closePanelView() {
        updateSearchParams((nextSearchParams) => {
            nextSearchParams.delete(panelQueryParam);
        });
    }
    function restoreLastPanelView(fallbackView) {
        const nextView = lastPanelViewRef.current ?? fallbackView;
        if (!nextView)
            return;
        setActivePanelView(nextView);
    }
    function setSidePanelWidth(width) {
        const nextWidth = clampSidePanelWidth(width);
        setSidePanelWidthState(nextWidth);
        clearTimeout(persistTimerRef.current);
        persistTimerRef.current = setTimeout(() => {
            if (typeof window !== 'undefined' && typeof window.localStorage?.setItem === 'function') {
                window.localStorage.setItem(sidePanelWidthStorageKey, String(nextWidth));
            }
        }, 300);
    }
    function togglePanelView(viewId) {
        if (activePanelView === viewId) {
            closePanelView();
            return;
        }
        setActivePanelView(viewId);
    }
    function selectEntity(entityId, options) {
        updateSearchParams((nextSearchParams) => {
            nextSearchParams.set(selectionQueryParam, entityId);
            if (options?.panelView) {
                nextSearchParams.set(panelQueryParam, options.panelView);
            }
        });
    }
    function clearEntity() {
        updateSearchParams((nextSearchParams) => {
            nextSearchParams.delete(selectionQueryParam);
        });
    }
    function openCommandPalette() {
        setCommandPaletteOpen(true);
    }
    function closeCommandPalette() {
        setCommandPaletteOpen(false);
    }
    // biome-ignore lint/correctness/useExhaustiveDependencies: inner setters/handlers are re-created each render; wrapping all of them in useCallback is a separate refactor — deps here are the observable state values only.
    const value = useMemo(() => ({
        activePanelView,
        lastPanelView: lastPanelViewRef.current,
        setActivePanelView,
        closePanelView,
        restoreLastPanelView,
        togglePanelView,
        sidePanelWidth: sidePanelWidthState,
        setSidePanelWidth,
        activeRail,
        setActiveRail,
        selectedEntityId,
        selectEntity,
        clearEntity,
        commandPaletteOpen,
        setCommandPaletteOpen,
        openCommandPalette,
        closeCommandPalette,
    }), [activePanelView, activeRail, commandPaletteOpen, selectedEntityId, sidePanelWidthState]);
    return _jsx(ShellStateContext.Provider, { value: value, children: children });
}
export function useShellState() {
    const context = useContext(ShellStateContext);
    if (!context) {
        throw new Error('useShellState must be used within a ShellStateProvider');
    }
    return context;
}
