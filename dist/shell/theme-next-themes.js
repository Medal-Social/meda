'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback, useEffect, useInsertionEffect, useMemo, useState, } from 'react';
import { ThemeCtx } from './theme.js';
const STORAGE_KEY = 'theme';
const MEDIA_QUERY = '(prefers-color-scheme: dark)';
const THEMES = ['light', 'dark'];
function narrow(value) {
    return value === 'light' || value === 'dark' || value === 'system' ? value : 'system';
}
function getMediaQueryList() {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
        return undefined;
    return window.matchMedia(MEDIA_QUERY);
}
function resolveSystemTheme(mql) {
    if (mql)
        return mql.matches ? 'dark' : 'light';
    return getMediaQueryList()?.matches ? 'dark' : 'light';
}
function getStoredTheme() {
    if (typeof window === 'undefined')
        return 'system';
    try {
        return narrow(window.localStorage.getItem(STORAGE_KEY));
    }
    catch {
        return 'system';
    }
}
function applyTheme(theme, resolvedTheme) {
    if (typeof document === 'undefined')
        return;
    const root = document.documentElement;
    const applied = theme === 'system' ? resolvedTheme : theme;
    root.classList.remove(...THEMES);
    root.classList.add(applied);
    root.style.colorScheme = applied;
}
function getClientThemeSnapshot() {
    const theme = getStoredTheme();
    return {
        theme,
        resolvedTheme: theme === 'system' ? resolveSystemTheme() : theme,
    };
}
function subscribeToSystemTheme(mql, listener) {
    if (!mql)
        return () => { };
    if (typeof mql.addEventListener === 'function') {
        mql.addEventListener('change', listener);
        return () => mql.removeEventListener('change', listener);
    }
    if (typeof mql.addListener === 'function') {
        mql.addListener(listener);
        return () => mql.removeListener?.(listener);
    }
    return () => { };
}
export function NextThemesAdapter({ children }) {
    const [theme, setThemeState] = useState('system');
    const [resolvedTheme, setResolvedTheme] = useState('light');
    const [hydrated, setHydrated] = useState(false);
    const setTheme = useCallback((next) => {
        setThemeState(next);
        const resolved = next === 'system' ? resolveSystemTheme() : next;
        setResolvedTheme(resolved);
        applyTheme(next, resolved);
        try {
            if (typeof window !== 'undefined')
                window.localStorage.setItem(STORAGE_KEY, next);
        }
        catch {
            // Ignore unavailable storage, matching next-themes' best-effort behavior.
        }
    }, []);
    useInsertionEffect(() => {
        const snapshot = getClientThemeSnapshot();
        applyTheme(snapshot.theme, snapshot.resolvedTheme);
    }, []);
    useEffect(() => {
        const stored = getClientThemeSnapshot();
        setThemeState(stored.theme);
        setResolvedTheme(stored.resolvedTheme);
        setHydrated(true);
        applyTheme(stored.theme, stored.resolvedTheme);
    }, []);
    useEffect(() => {
        if (!hydrated)
            return;
        const mql = getMediaQueryList();
        const sync = (_event) => {
            const resolved = theme === 'system' ? resolveSystemTheme(mql) : theme;
            setResolvedTheme(resolved);
            applyTheme(theme, resolved);
        };
        sync();
        return subscribeToSystemTheme(mql, sync);
    }, [hydrated, theme]);
    useEffect(() => {
        const handleStorage = (event) => {
            if (event.key !== STORAGE_KEY)
                return;
            setThemeState(narrow(event.newValue));
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);
    const value = useMemo(() => ({
        theme,
        setTheme,
        resolvedTheme,
    }), [theme, setTheme, resolvedTheme]);
    return _jsx(ThemeCtx.Provider, { value: value, children: children });
}
