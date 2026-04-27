import type { ReactNode } from 'react';
import type { ThemeAdapter } from './types.js';
/** @internal – used by theme adapters; not part of the public API. */
export declare const ThemeCtx: import("react").Context<ThemeAdapter | null>;
export declare function DefaultThemeProvider({ children }: {
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function useTheme(): ThemeAdapter;
export declare function ThemeToggle(): import("react/jsx-runtime").JSX.Element;
