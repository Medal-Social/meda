import type { HTMLAttributes, ReactNode } from 'react';
export interface AuthMessageProps extends HTMLAttributes<HTMLDivElement> {
    children?: ReactNode;
}
export declare function AuthError({ children, className, ...props }: AuthMessageProps): import("react/jsx-runtime").JSX.Element | null;
export declare function AuthNotice({ children, className, ...props }: AuthMessageProps): import("react/jsx-runtime").JSX.Element | null;
export interface AuthOneTapSlotProps extends HTMLAttributes<HTMLDivElement> {
    children?: ReactNode;
}
export declare function AuthOneTapSlot({ children, className, ...props }: AuthOneTapSlotProps): import("react/jsx-runtime").JSX.Element;
