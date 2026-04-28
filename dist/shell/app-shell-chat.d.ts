import type { ReactNode } from 'react';
export interface AppShellChatProps {
    globalActions?: ReactNode;
    children: ReactNode;
}
export declare function AppShellChat({ globalActions, children }: AppShellChatProps): import("react/jsx-runtime").JSX.Element;
