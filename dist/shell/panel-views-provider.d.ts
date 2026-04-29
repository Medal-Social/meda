import { type ReactNode } from 'react';
import { type PanelViewRegistration } from './shell-provider.js';
import type { PanelView } from './types.js';
export interface PanelViewsProviderProps {
    views: PanelView[];
    defaultView?: string;
    children: ReactNode;
}
export interface ResolvedPanelViews {
    panelViews: PanelView[];
    defaultView?: string;
}
export declare function mergePanelViews(staticViews: PanelView[] | undefined, registrations: PanelViewRegistration[], staticDefaultView?: string): ResolvedPanelViews;
export declare function useResolvedPanelViews(staticViews?: PanelView[], staticDefaultView?: string): ResolvedPanelViews;
export declare function PanelViewsProvider({ views, defaultView, children }: PanelViewsProviderProps): import("react/jsx-runtime").JSX.Element;
