'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { Monitor, Moon, Sun } from 'lucide-react';
import { createContext, useContext, useEffect, useState } from 'react';
const NEXT = {
    light: 'dark',
    dark: 'system',
    system: 'light',
};
const ICON = {
    light: Sun,
    dark: Moon,
    system: Monitor,
};
const LABEL = {
    light: 'Switch to dark theme',
    dark: 'Switch to system theme',
    system: 'Switch to light theme',
};
/** @internal – used by theme adapters; not part of the public API. */
export const ThemeCtx = createContext(null);
export function DefaultThemeProvider({ children }) {
    const [theme, setThemeState] = useState('system');
    const [resolvedTheme, setResolvedTheme] = useState('light');
    useEffect(() => {
        const saved = window.localStorage.getItem('meda:theme');
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
            setThemeState(saved);
        }
    }, []);
    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const apply = () => {
            const resolved = theme === 'system' ? (mq.matches ? 'dark' : 'light') : theme;
            setResolvedTheme(resolved);
            document.documentElement.classList.toggle('dark', resolved === 'dark');
        };
        apply();
        mq.addEventListener('change', apply);
        return () => mq.removeEventListener('change', apply);
    }, [theme]);
    const setTheme = (t) => {
        setThemeState(t);
        window.localStorage.setItem('meda:theme', t);
    };
    return (_jsx(ThemeCtx.Provider, { value: { theme, setTheme, resolvedTheme }, children: children }));
}
export function useTheme() {
    const v = useContext(ThemeCtx);
    if (!v)
        throw new Error('useTheme must be used inside <MedaShellProvider>');
    return v;
}
export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const Icon = ICON[theme];
    return (_jsx("button", { type: "button", "aria-label": LABEL[theme], onClick: () => setTheme(NEXT[theme]), children: _jsx(Icon, { "aria-hidden": "true" }) }));
}
