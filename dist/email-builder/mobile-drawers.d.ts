import type { ReactNode } from 'react';
interface MobileDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    children: ReactNode;
}
/** Generic bottom-sheet drawer used for the mobile palette/inspector. */
export declare function MobileDrawer({ open, onOpenChange, title, children }: MobileDrawerProps): import("react/jsx-runtime").JSX.Element;
export {};
