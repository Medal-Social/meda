import type { ReactNode } from 'react';
export type ShellAuthTheme = 'light' | 'dark';
export interface ShellAuthFrameProps {
    children: ReactNode;
    title: ReactNode;
    description?: ReactNode;
    brandName?: ReactNode;
    brandMark?: ReactNode;
    eyebrow?: ReactNode;
    preview?: ReactNode;
    actions?: ReactNode;
    className?: string;
}
export interface ShellAuthThemeToggleProps {
    value: ShellAuthTheme;
    onValueChange: (value: ShellAuthTheme) => void;
    className?: string;
    lightLabel?: string;
    darkLabel?: string;
}
export declare function ShellAuthFrame({ children, title, description, brandName, brandMark, eyebrow, preview, actions, className, }: ShellAuthFrameProps): import("react/jsx-runtime").JSX.Element;
export declare function ShellAuthThemeToggle({ value, onValueChange, className, lightLabel, darkLabel, }: ShellAuthThemeToggleProps): import("react/jsx-runtime").JSX.Element;
