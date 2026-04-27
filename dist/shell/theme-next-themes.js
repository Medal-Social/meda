'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes';
import { ThemeCtx } from './theme.js';
function narrow(value) {
    if (value === 'light' || value === 'dark' || value === 'system')
        return value;
    return 'system';
}
function narrowResolved(value) {
    return value === 'dark' ? 'dark' : 'light';
}
function NextThemesBridge({ children }) {
    const { theme, setTheme, resolvedTheme } = useNextTheme();
    const value = {
        theme: narrow(theme),
        setTheme: (t) => setTheme(t),
        resolvedTheme: narrowResolved(resolvedTheme),
    };
    return _jsx(ThemeCtx.Provider, { value: value, children: children });
}
export function NextThemesAdapter({ children }) {
    return (_jsx(NextThemesProvider, { attribute: "class", enableSystem: true, defaultTheme: "system", children: _jsx(NextThemesBridge, { children: children }) }));
}
